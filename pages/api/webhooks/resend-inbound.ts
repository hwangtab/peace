import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyResendWebhook, getReceivedEmail, parseFromAddress } from '@/lib/resend';
import { createSupabaseServiceClient } from '@/lib/supabaseService';

// Svix 서명 검증을 위해 raw body가 필요하므로 기본 bodyParser를 끈다.
export const config = { api: { bodyParser: false } };

// bodyParser를 끈 공개 엔드포인트이므로 본문 크기를 직접 제한한다(메모리 고갈 방지).
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB

const readRawBody = (req: NextApiRequest): Promise<string> =>
  new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error('payload_too_large'));
        return;
      }
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const headerValue = (v: string | string[] | undefined): string | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'webhook_secret_not_configured' });
    return;
  }

  let rawBody: string;
  try {
    rawBody = await readRawBody(req);
  } catch {
    res.status(413).json({ error: 'payload_too_large' });
    return;
  }
  const valid = verifyResendWebhook(
    rawBody,
    {
      id: headerValue(req.headers['svix-id']),
      timestamp: headerValue(req.headers['svix-timestamp']),
      signature: headerValue(req.headers['svix-signature']),
    },
    secret
  );
  if (!valid) {
    res.status(401).json({ error: 'invalid_signature' });
    return;
  }

  let event: { type?: string; data?: { email_id?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: 'invalid_json' });
    return;
  }

  // 수신 이벤트만 처리. 그 외는 200으로 무시(재시도 방지).
  if (event.type !== 'email.received' || !event.data?.email_id) {
    res.status(200).json({ ok: true, ignored: true });
    return;
  }

  const emailId = event.data.email_id;

  try {
    const mail = await getReceivedEmail(emailId);
    const fromParsed = parseFromAddress(mail.from);

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from('mailbox_messages').insert({
      direction: 'inbound',
      resend_id: emailId,
      from_email: fromParsed.email,
      from_name: fromParsed.name,
      to_email: mail.to[0] ?? '',
      subject: mail.subject,
      text_body: mail.text,
      html_body: mail.html,
    });

    // resend_id 유니크 충돌(중복 전송)은 정상 처리로 간주.
    if (error && error.code !== '23505') {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    // Resend가 재시도하도록 5xx 반환.
    res.status(502).json({ error: err instanceof Error ? err.message : 'fetch_failed' });
  }
}
