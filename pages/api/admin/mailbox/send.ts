import type { NextApiRequest, NextApiResponse } from 'next';
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
import type { SupabaseClient } from '@supabase/supabase-js';

// Vercel 함수 실행 시간 상한(초). 청크 하나(≤CHUNK_SIZE × ~throttle)는 수 초면 끝나지만,
// Resend 지연·재시도까지 감안한 안전 여유. Pages Router는 이 export를 인식한다.
export const config = { maxDuration: 60 };

const FROM_ADDRESS = '강정 피스앤뮤직캠프 <admin@peaceandmusic.net>';

// 한 발송 작업(job)의 최대 수신자 수. 비용 폭주·발신 도메인 평판 손상 방어.
const MAX_RECIPIENTS = 500;

// 한 HTTP 요청당 발송하는 수신자 수. 600ms 스로틀 포함 ~5초 안에 끝나도록 소량.
const CHUNK_SIZE = 8;

interface Recipient {
  id: string;
  name: string;
  email: string;
}

interface FailedEntry {
  email: string;
  error: string;
}

interface BroadcastJob {
  id: string;
  subject: string;
  text_body: string;
  from_email: string;
  recipients: Recipient[];
  total: number;
  cursor: number;
  sent_count: number;
  failed: FailedEntry[];
  status: 'in_progress' | 'done';
}

// 시작 요청: 명단/직접입력으로 job 생성. 이어가기 요청: jobId만.
const startSchema = z.object({
  contactIds: z.array(z.string().uuid()).max(MAX_RECIPIENTS).default([]),
  manualText: z.string().max(100_000).default(''),
  subject: z.string(),
  text: z.string(),
});
const continueSchema = z.object({ jobId: z.string().uuid() });

const JOB_COLUMNS =
  'id, subject, text_body, from_email, recipients, total, cursor, sent_count, failed, status';

/** 실패 목록 병합(이메일 기준 중복 제거). 청크 재호출 시 같은 실패가 겹쳐 쌓이는 것 방지. */
const mergeFailed = (existing: FailedEntry[], incoming: FailedEntry[]): FailedEntry[] => {
  const byEmail = new Map<string, FailedEntry>();
  for (const f of existing) byEmail.set(f.email, f);
  for (const f of incoming) byEmail.set(f.email, f);
  return [...byEmail.values()];
};

/**
 * 한 청크를 발송하고 job 진행 상태를 갱신한다. 멱등성: 이미 mailbox_messages에
 * 성공 기록(send_error is null)이 있는 수신자는 재발송하지 않는다. cursor는 서버 소유라
 * 응답 유실로 클라가 같은 청크를 재요청해도 중복 발송이 일어나지 않는다.
 */
async function processChunk(
  supabase: SupabaseClient,
  job: BroadcastJob,
  createdBy: string,
  res: NextApiResponse
): Promise<void> {
  const start = job.cursor;
  const slice = job.recipients.slice(start, start + CHUNK_SIZE);

  // 남은 수신자가 없으면 완료 처리하고 종료(예: total=0 이거나 이미 끝난 경우).
  if (slice.length === 0) {
    if (job.status !== 'done') {
      await supabase
        .from('mail_broadcast_jobs')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', job.id);
    }
    res.status(200).json({
      jobId: job.id,
      done: true,
      total: job.total,
      cursor: job.cursor,
      remaining: 0,
      sent: [],
      sentCount: job.sent_count,
      failed: job.failed,
    });
    return;
  }

  // 이 job에서 이미 성공 발송된 이메일 집합(멱등성 스킵 대상).
  const { data: doneRows } = await supabase
    .from('mailbox_messages')
    .select('to_email')
    .eq('campaign_id', job.id)
    .is('send_error', null);
  const skipEmails = new Set<string>(
    (doneRows ?? []).map((r: { to_email: string }) => r.to_email.toLowerCase())
  );

  const chunkResult = await runBroadcast({
    recipients: slice,
    subject: job.subject,
    text: job.text_body,
    from: job.from_email || FROM_ADDRESS,
    campaignId: job.id,
    skipEmails,
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
        created_by: createdBy,
      });
      if (recordError) {
        console.error(
          `[mailbox/send] 발송 기록 실패 (job ${row.campaign_id}, to ${row.to_email}): ${recordError.message}`
        );
      }
    },
  });

  const newCursor = start + slice.length;
  const newSentCount = job.sent_count + chunkResult.sent.length;
  const mergedFailed = mergeFailed(job.failed, chunkResult.failed);
  const done = newCursor >= job.total;

  const { error: updateError } = await supabase
    .from('mail_broadcast_jobs')
    .update({
      cursor: newCursor,
      sent_count: newSentCount,
      failed: mergedFailed,
      status: done ? 'done' : 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', job.id);
  // 진행 상태 저장 실패 시 500으로 알려 클라가 재시도하게 한다. cursor가 안 올라갔으므로
  // 다음 시도에서 같은 청크를 다시 돌지만 skipEmails가 중복 발송을 막는다.
  if (updateError) {
    console.error(`[mailbox/send] job 진행 저장 실패 (job ${job.id}): ${updateError.message}`);
    res.status(500).json({ error: 'progress_save_failed', jobId: job.id });
    return;
  }

  res.status(200).json({
    jobId: job.id,
    done,
    total: job.total,
    cursor: newCursor,
    remaining: Math.max(0, job.total - newCursor),
    sent: chunkResult.sent,
    sentCount: newSentCount,
    failed: mergedFailed,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const supabase = createSupabaseServerClient(req, res);

  try {
    // ── 이어가기: jobId가 오면 다음 청크만 발송 ──
    if (req.body && typeof req.body === 'object' && 'jobId' in req.body) {
      const { jobId } = continueSchema.parse(req.body);
      const { data, error } = await supabase
        .from('mail_broadcast_jobs')
        .select(JOB_COLUMNS)
        .eq('id', jobId)
        .maybeSingle();
      if (error) {
        console.error('[mailbox/send] job 조회 실패:', error.message);
        return res.status(500).json({ error: 'internal_error' });
      }
      if (!data) return res.status(404).json({ error: 'job_not_found' });
      await processChunk(supabase, data as BroadcastJob, session.member.email, res);
      return;
    }

    // ── 시작: 수신자 명단 확정 → job 생성 → 첫 청크 발송 ──
    const body = startSchema.parse(req.body);
    const subjectCheck = validateBroadcastSubject(body.subject);
    if (!subjectCheck.ok) return res.status(400).json({ error: subjectCheck.reason });
    const bodyCheck = validateBroadcastBody(body.text);
    if (!bodyCheck.ok) return res.status(400).json({ error: bodyCheck.reason });

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
    const byEmail = new Map<string, Recipient>();
    for (const c of contactRecipients) {
      const email = c.email.toLowerCase();
      byEmail.set(email, { id: c.id, name: c.name, email });
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

    // 직접입력 형식 오류는 애초에 실패로 job.failed에 심어 두어 전 청크에서 노출.
    const seedFailed: FailedEntry[] = manual.errors.map((bad) => ({
      email: bad,
      error: '이메일 형식 오류',
    }));

    const { data: created, error: createError } = await supabase
      .from('mail_broadcast_jobs')
      .insert({
        subject: subjectCheck.value,
        text_body: bodyCheck.value,
        from_email: FROM_ADDRESS,
        recipients,
        total: recipients.length,
        cursor: 0,
        sent_count: 0,
        failed: seedFailed,
        status: 'in_progress',
        created_by: session.member.email,
      })
      .select(JOB_COLUMNS)
      .single();
    if (createError || !created) {
      console.error('[mailbox/send] job 생성 실패:', createError?.message);
      return res.status(500).json({ error: 'internal_error' });
    }

    await processChunk(supabase, created as BroadcastJob, session.member.email, res);
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
