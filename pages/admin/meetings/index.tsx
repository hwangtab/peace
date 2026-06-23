import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { MEETING_STATUS_LABELS } from '@/lib/meetingForms';
import type { Meeting } from '@/types/meeting';
import type { AdminMember } from '@/types/cms';

interface AdminMeetingsPageProps {
  meetings: Meeting[];
  member: AdminMember;
  initialError?: string;
}

const dateFmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' });

const formatMeetingDate = (m: Meeting): string => {
  if (!m.meeting_date) return '일시 미정';
  // date-only 문자열은 로컬 자정으로 파싱(UTC 파싱 시 음수 시간대에서 하루 밀림 방지)
  const base = dateFmt.format(new Date(`${m.meeting_date}T00:00:00`));
  return m.meeting_time ? `${base} ${m.meeting_time}` : base;
};

const groupByYear = (meetings: Meeting[]): [string, Meeting[]][] => {
  const groups = new Map<string, Meeting[]>();
  for (const m of meetings) {
    const year = m.meeting_date ? m.meeting_date.slice(0, 4) + '년' : '일시 미정';
    const list = groups.get(year) ?? [];
    list.push(m);
    groups.set(year, list);
  }
  return Array.from(groups.entries());
};

export default function AdminMeetingsPage({
  meetings,
  member,
  initialError = '',
}: AdminMeetingsPageProps) {
  const canEdit = canEditContent(member);
  const groups = groupByYear(meetings);

  return (
    <AdminLayout title="회의록" member={member}>
      {initialError && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {initialError}
        </p>
      )}

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-deep-ocean/70">기획단 회의 {meetings.length}건</p>
        {canEdit && (
          <Link
            href="/admin/meetings/new"
            className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            새 회의
          </Link>
        )}
      </div>

      {meetings.length === 0 ? (
        <p className="rounded border border-deep-ocean/10 bg-white px-4 py-10 text-center text-sm text-balance text-deep-ocean/60">
          등록된 회의가 없습니다.
          {canEdit
            ? ' 상단의 “새 회의”로 추가하세요.'
            : ' 편집 권한이 있는 관리자에게 등록을 요청하세요.'}
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(([year, list]) => (
            <section key={year}>
              <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">{year}</h2>
              <ul className="space-y-2">
                {list.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/admin/meetings/${m.id}`}
                      className="flex items-center justify-between gap-3 rounded border border-deep-ocean/10 bg-white px-4 py-3 transition hover:border-jeju-ocean/40 hover:bg-jeju-ocean/5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-deep-ocean">
                          {m.title}
                        </span>
                        <span className="block text-sm text-deep-ocean/60">
                          {formatMeetingDate(m)}
                          {m.location ? ` · ${m.location}` : ''}
                        </span>
                      </span>
                      <span
                        className={
                          'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ' +
                          (m.status === 'completed'
                            ? 'bg-jeju-ocean/10 text-jeju-ocean'
                            : 'bg-ocean-sand text-deep-ocean/70')
                        }
                      >
                        {MEETING_STATUS_LABELS[m.status]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const supabase = createSupabaseServerClient(context.req, context.res);
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('meeting_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  return {
    props: {
      meetings: data ?? [],
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
