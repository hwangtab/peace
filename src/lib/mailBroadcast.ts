import { personalizeBody } from './mailContactsForms';

export interface BroadcastRecipient {
  id: string;
  name: string;
  email: string;
}

export interface BroadcastRecord {
  to_email: string;
  subject: string;
  text_body: string;
  campaign_id: string;
  send_error: string | null;
  resend_id: string | null;
}

export interface BroadcastResult {
  sent: number;
  failed: { email: string; error: string }[];
}

interface RunBroadcastOptions {
  recipients: BroadcastRecipient[];
  subject: string;
  text: string;
  from: string;
  campaignId: string;
  send: (input: { from: string; to: string; subject: string; text: string }) => Promise<{
    id: string;
  }>;
  record: (row: BroadcastRecord) => Promise<void>;
}

/** 수신자별 개인화 발송. 성공/실패와 무관하게 record를 호출해 1행씩 남긴다. */
export const runBroadcast = async (opts: RunBroadcastOptions): Promise<BroadcastResult> => {
  const result: BroadcastResult = { sent: 0, failed: [] };
  for (const r of opts.recipients) {
    const text = personalizeBody(opts.text, r.name);
    let resendId: string | null = null;
    let sendError: string | null = null;
    try {
      const sent = await opts.send({ from: opts.from, to: r.email, subject: opts.subject, text });
      resendId = sent.id;
      result.sent += 1;
    } catch (err) {
      sendError = err instanceof Error ? err.message : String(err);
      result.failed.push({ email: r.email, error: sendError });
    }
    await opts.record({
      to_email: r.email,
      subject: opts.subject,
      text_body: text,
      campaign_id: opts.campaignId,
      send_error: sendError,
      resend_id: resendId,
    });
  }
  return result;
};
