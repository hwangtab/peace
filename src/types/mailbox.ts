export type MailboxDirection = 'inbound' | 'outbound';

export interface MailboxMessage {
  id: string;
  direction: MailboxDirection;
  resend_id: string | null;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  text_body: string;
  html_body: string;
  reply_to_id: string | null;
  is_read: boolean;
  created_by: string;
  created_at: string;
}
