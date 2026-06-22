import crypto from 'crypto';

const RESEND_API = 'https://api.resend.com';

const apiKey = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured.');
  return key;
};

/**
 * Resend(Svix) webhook 서명 검증.
 * headers: svix-id / svix-timestamp / svix-signature, secret: "whsec_<base64>".
 * 서명 대상 = `${id}.${timestamp}.${rawBody}`, HMAC-SHA256(base64-decoded key) → base64.
 */
export const verifyResendWebhook = (
  rawBody: string,
  headers: { id?: string | null; timestamp?: string | null; signature?: string | null },
  secret: string,
  toleranceSeconds = 300
): boolean => {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature || !secret) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSeconds) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  // svix-signature: "v1,<sig> v1,<sig2> ..." — 하나라도 일치하면 통과.
  return signature.split(' ').some((part) => {
    const sig = part.includes(',') ? part.split(',')[1] : part;
    if (!sig) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
};

export interface ReceivedEmail {
  text: string;
  html: string;
  from: string;
  to: string[];
  subject: string;
  message_id: string | null;
  reply_to: string[] | null;
}

/** 인바운드 수신 메일 본문 조회: GET /emails/receiving/{id} */
export const getReceivedEmail = async (emailId: string): Promise<ReceivedEmail> => {
  const res = await fetch(`${RESEND_API}/emails/receiving/${encodeURIComponent(emailId)}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!res.ok) {
    throw new Error(`Resend received-email fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as Partial<ReceivedEmail>;
  return {
    text: typeof data.text === 'string' ? data.text : '',
    html: typeof data.html === 'string' ? data.html : '',
    from: typeof data.from === 'string' ? data.from : '',
    to: Array.isArray(data.to) ? data.to : [],
    subject: typeof data.subject === 'string' ? data.subject : '',
    message_id: typeof data.message_id === 'string' ? data.message_id : null,
    reply_to: Array.isArray(data.reply_to) ? data.reply_to : null,
  };
};

export interface SendEmailInput {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

/** 메일 발송: POST /emails → 성공 시 { id } */
export const sendEmail = async (input: SendEmailInput): Promise<{ id: string }> => {
  const body: Record<string, unknown> = {
    from: input.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  };
  if (input.html) body.html = input.html;
  if (input.replyTo) body.reply_to = input.replyTo;
  if (input.headers) body.headers = input.headers;

  const res = await fetch(`${RESEND_API}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok || !payload.id) {
    throw new Error(payload.message || `Resend send failed: ${res.status}`);
  }
  return { id: payload.id };
};

/** "이름 <email>" 형식에서 이름/주소 분리. 실패 시 전체를 email로. */
export const parseFromAddress = (raw: string): { name: string; email: string } => {
  const m = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m && m[2]) return { name: (m[1] || '').replace(/^"|"$/g, '').trim(), email: m[2].trim() };
  return { name: '', email: raw.trim() };
};
