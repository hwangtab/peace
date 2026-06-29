import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { sendEmail } from '@/lib/resend';
import { runBroadcast } from '@/lib/mailBroadcast';
import {
  validateBroadcastBody,
  validateBroadcastSubject,
  parseManualRecipients,
} from '@/lib/mailContactsForms';
import type { MailContact } from '@/types/mailContacts';

const FROM_ADDRESS = '강정 피스앤뮤직캠프 <admin@peaceandmusic.net>';

// 한 번에 발송 가능한 최대 수신자 수. 비용 폭주·발신 도메인 평판 손상 방어.
const MAX_RECIPIENTS = 500;

const schema = z.object({
  contactIds: z.array(z.string().uuid()).max(MAX_RECIPIENTS).default([]),
  manualText: z.string().max(100_000).default(''),
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
    // 명단에서 고른 연락처(활성만 재확인)
    let contactRecipients: Pick<MailContact, 'id' | 'name' | 'email'>[] = [];
    if (body.contactIds.length > 0) {
      const { data, error } = await supabase
        .from('mail_contacts')
        .select('id, name, email, is_active')
        .in('id', body.contactIds)
        .eq('is_active', true);
      if (error) {
        console.error('[mailbox/send] 연락처 조회 실패:', error.message);
        return res.status(500).json({ error: 'internal_error' });
      }
      contactRecipients = (data as Pick<MailContact, 'id' | 'name' | 'email'>[]) ?? [];
    }

    // 직접 입력 수신자(서버에서 파싱·검증, 클라 신뢰 안 함)
    const manual = parseManualRecipients(body.manualText);

    // 이메일(소문자) 기준 중복 제거 — 명단 연락처를 우선(이름 보존)
    const byEmail = new Map<string, { id: string; name: string; email: string }>();
    for (const c of contactRecipients) {
      const email = c.email.toLowerCase();
      byEmail.set(email, { ...c, email });
    }
    for (const m of manual.recipients) {
      if (!byEmail.has(m.email)) byEmail.set(m.email, { id: '', name: m.name, email: m.email });
    }
    const recipients = [...byEmail.values()];
    if (recipients.length === 0)
      return res.status(400).json({ error: '발송 가능한 수신자가 없습니다.' });
    if (recipients.length > MAX_RECIPIENTS)
      return res.status(400).json({
        error: `한 번에 최대 ${MAX_RECIPIENTS}명까지 발송할 수 있습니다. (현재 ${recipients.length}명) 나눠서 보내세요.`,
      });

    const campaignId = randomUUID();
    const result = await runBroadcast({
      recipients,
      subject: subjectCheck.value,
      text: bodyCheck.value,
      from: FROM_ADDRESS,
      campaignId,
      send: sendEmail,
      record: async (row) => {
        const { error: recordError } = await supabase.from('mailbox_messages').insert({
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
        if (recordError) {
          console.error(
            `[mailbox/send] 발송 기록 실패 (campaign ${row.campaign_id}, to ${row.to_email}): ${recordError.message}`
          );
        }
      },
    });

    // 형식이 잘못된 직접입력 주소도 실패로 함께 보고
    const failed = [
      ...result.failed,
      ...manual.errors.map((bad) => ({ email: bad, error: '이메일 형식 오류' })),
    ];

    return res.status(200).json({ campaign_id: campaignId, sent: result.sent, failed });
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
