import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { sendEmail } from '@/lib/resend';
import {
  isValidEmail,
  validateReplyBody,
  validateReplySubject,
  replySubject,
} from '@/lib/mailboxForms';

const FROM_ADDRESS = '강정 피스앤뮤직캠프 <admin@peaceandmusic.net>';

const replySchema = z.object({
  reply_to_id: z.string().uuid().optional(),
  to: z.string(),
  subject: z.string().optional(),
  text: z.string(),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  try {
    const body = replySchema.parse(req.body);

    const to = body.to.trim();
    if (!isValidEmail(to)) {
      res.status(400).json({ error: '받는사람 이메일 주소가 올바르지 않습니다.' });
      return;
    }
    const bodyResult = validateReplyBody(body.text);
    if (!bodyResult.ok) {
      res.status(400).json({ error: bodyResult.reason });
      return;
    }
    const subjectResult = validateReplySubject(body.subject ?? '');
    if (!subjectResult.ok) {
      res.status(400).json({ error: subjectResult.reason });
      return;
    }
    const subject = replySubject(subjectResult.value);

    let sent: { id: string };
    try {
      sent = await sendEmail({ from: FROM_ADDRESS, to, subject, text: bodyResult.value });
    } catch (err) {
      res
        .status(502)
        .json({ error: err instanceof Error ? err.message : '메일 발송에 실패했습니다.' });
      return;
    }

    const supabase = createSupabaseServerClient(req, res);
    const { data, error } = await supabase
      .from('mailbox_messages')
      .insert({
        direction: 'outbound',
        resend_id: sent.id,
        from_email: 'admin@peaceandmusic.net',
        to_email: to,
        subject,
        text_body: bodyResult.value,
        reply_to_id: body.reply_to_id ?? null,
        is_read: true,
        created_by: session.member.email,
      })
      .select('*')
      .single();
    if (error) {
      // 메일은 이미 발송됨 — 기록 실패만 보고(중복 등).
      res.status(500).json({ error: `발송됨, 기록 실패: ${error.message}` });
      return;
    }

    res.status(200).json({ message: data });
  } catch (error) {
    res.status(400).json({ error: getErrorMessage(error) });
  }
}
