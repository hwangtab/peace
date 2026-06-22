import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import MeetingMinutesEditor from '@/components/admin/meeting/MeetingMinutesEditor';
import AgendaSection from '@/components/admin/meeting/AgendaSection';
import AttendeeSection from '@/components/admin/meeting/AttendeeSection';
import AttachmentSection from '@/components/admin/meeting/AttachmentSection';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { MEETING_STATUS_LABELS } from '@/lib/meetingForms';
import type {
  Meeting,
  MeetingAgenda,
  MeetingAttendee,
  MeetingAttachment,
} from '@/types/meeting';
import type { AdminMember } from '@/types/cms';

interface MeetingDetailPageProps {
  meeting: Meeting;
  agendas: MeetingAgenda[];
  attendees: MeetingAttendee[];
  attachments: MeetingAttachment[];
  member: AdminMember;
}

const dateFmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' });

const formatMeetingDate = (m: Meeting): string => {
  if (!m.meeting_date) return '일시 미정';
  const base = dateFmt.format(new Date(m.meeting_date));
  return m.meeting_time ? `${base} ${m.meeting_time}` : base;
};

export default function MeetingDetailPage({
  meeting,
  agendas,
  attendees,
  attachments,
  member,
}: MeetingDetailPageProps) {
  const router = useRouter();
  const canEdit = canEditContent(member);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const refresh = () => router.replace(router.asPath);

  const toggleStatus = async () => {
    setError('');
    setIsBusy(true);
    const next = meeting.status === 'scheduled' ? 'completed' : 'scheduled';
    try {
      const response = await fetch(`/api/admin/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.meeting) {
        setError(payload.error || '상태 변경에 실패했습니다.');
        setIsBusy(false);
        return;
      }
      setIsBusy(false);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsBusy(false);
    }
  };

  const deleteMeeting = async () => {
    if (!window.confirm('이 회의를 삭제하면 안건·참석자·첨부도 모두 삭제됩니다. 계속할까요?')) {
      return;
    }
    setError('');
    setIsBusy(true);
    try {
      const response = await fetch(`/api/admin/meetings/${meeting.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || '삭제에 실패했습니다.');
        setIsBusy(false);
        return;
      }
      router.push('/admin/meetings');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsBusy(false);
    }
  };

  return (
    <AdminLayout title="회의 상세" member={member}>
      <Link href="/admin/meetings" className="mb-4 inline-block text-sm text-jeju-ocean hover:text-deep-ocean">
        ← 회의 목록
      </Link>

      {error && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      <header className="mb-6 rounded border border-deep-ocean/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-deep-ocean">{meeting.title}</h1>
            <p className="mt-1 text-sm text-deep-ocean/70">
              {formatMeetingDate(meeting)}
              {meeting.location ? ` · ${meeting.location}` : ''}
            </p>
          </div>
          <span
            className={
              'shrink-0 rounded-full px-3 py-1 text-sm font-semibold ' +
              (meeting.status === 'completed'
                ? 'bg-jeju-ocean/10 text-jeju-ocean'
                : 'bg-ocean-sand text-deep-ocean/70')
            }
          >
            {MEETING_STATUS_LABELS[meeting.status]}
          </span>
        </div>

        {canEdit && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleStatus}
              disabled={isBusy}
              className="rounded border border-jeju-ocean/40 px-3 py-1.5 text-sm font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:opacity-60"
            >
              {meeting.status === 'scheduled' ? '완료로 표시' : '예정으로 되돌리기'}
            </button>
            <button
              type="button"
              onClick={deleteMeeting}
              disabled={isBusy}
              className="rounded border border-sunset-coral/50 bg-white px-3 py-1.5 text-sm font-semibold text-sunset-coral transition hover:bg-sunset-coral/10 disabled:opacity-60"
            >
              회의 삭제
            </button>
          </div>
        )}
      </header>

      <div className="space-y-6">
        <AgendaSection meetingId={meeting.id} agendas={agendas} canEdit={canEdit} />
        <AttendeeSection meetingId={meeting.id} attendees={attendees} canEdit={canEdit} />
        <AttachmentSection meetingId={meeting.id} attachments={attachments} canEdit={canEdit} />
        <MeetingMinutesEditor meetingId={meeting.id} initialMd={meeting.minutes_md} canEdit={canEdit} />
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const id = context.params?.id;
  if (typeof id !== 'string') return { notFound: true };

  const supabase = createSupabaseServerClient(context.req, context.res);
  const [meetingRes, agendasRes, attendeesRes, attachmentsRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('meeting_agendas')
      .select('*')
      .eq('meeting_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('meeting_attendees')
      .select('*')
      .eq('meeting_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('meeting_attachments')
      .select('*')
      .eq('meeting_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (!meetingRes.data) return { notFound: true };

  return {
    props: {
      meeting: meetingRes.data,
      agendas: agendasRes.data ?? [],
      attendees: attendeesRes.data ?? [],
      attachments: attachmentsRes.data ?? [],
      member: session.member,
    },
  };
};
