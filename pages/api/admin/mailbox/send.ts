import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { sendEmail } from '@/lib/resend';
import { runBroadcast } from '@/lib/mailBroadcast';
import { validateBroadcastBody, validateBroadcastSubject } from '@/lib/mailContactsForms';
import type { MailContact } from '@/types/mailContacts';

const FROM_ADDRESS = '강정 피스앤뮤직캠프 <admin@peaceandmusic.net>';

const schema = z.object({
  contactIds: z.array(z.string().uuid()).min(1),
  subject: z.string(),
  text: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  try {
    const body = schema.parse(req.body);
    const subjectCheck = validateBroadcastSubject(body.subject);
    if (!subjectCheck.ok) return res.status(400).json({ error: subjectCheck.reason });
    const bodyCheck = validateBroadcastBody(body.text);
    if (!bodyCheck.ok) return res.status(400).json({ error: bodyCheck.reason });

    const supabase = createSupabaseServerClient(req, res);
    const { data, error } = await supabase
      .from('mail_contacts')
      .select('id, name, email, is_active')
      .in('id', body.contactIds)
      .eq('is_active', true);
    if (error) return res.status(500).json({ error: error.message });
    const recipients = (data as Pick<MailContact, 'id' | 'name' | 'email'>[]) ?? [];
    if (recipients.length === 0)
      return res.status(400).json({ error: '발송 가능한 수신자가 없습니다.' });

    const campaignId = randomUUID();
    const result = await runBroadcast({
      recipients,
      subject: subjectCheck.value,
      text: bodyCheck.value,
      from: FROM_ADDRESS,
      campaignId,
      send: sendEmail,
      record: async (row) => {
        await supabase.from('mailbox_messages').insert({
          direction: 'outbound',
          resend_id: row.resend_id,
          from_email: 'admin@peaceandmusic.net',
          to_email: row.to_email,
          subject: row.subject,
          text_body: row.text_body,
          campaign_id: row.campaign_id,
          send_error: row.send_error,
          is_read: true,
          created_by: session.member.email,
        });
      },
    });

    return res.status(200).json({ campaign_id: campaignId, ...result });
  } catch (error) {
    const msg =
      error instanceof ZodError
        ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
        : error instanceof Error
          ? error.message
          : String(error);
    return res.status(400).json({ error: msg });
  }
}
