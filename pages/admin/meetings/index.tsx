import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { MEETING_STATUS_LABELS } from '@/lib/meetingForms';
import { CAMP_EDITION_YEARS, campEditionLabel } from '@/lib/campEditions';
import type { Meeting } from '@/types/meeting';
import type { AdminMember } from '@/types/cms';

interface AdminMeetingsPageProps {
  meetings: Meeting[];
  member: AdminMember;
  selectedYear: string;
  initialError?: string;
}

const dateFmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' });

const formatMeetingDate = (m: Meeting): string => {
  if (!m.meeting_date) return '일시 미정';
  // date-only 문자열은 로컬 자정으로 파싱(UTC 파싱 시 음수 시간대에서 하루 밀림 방지)
  const base = dateFmt.format(new Date(`${m.meeting_date}T00:00:00`));
  return m.meeting_time ? `${base} ${m.meeting_time}` : base;
};

const groupByEdition = (meetings: Meeting[]): [number | null, Meeting[]][] => {
  const groups = new Map<number | null, Meeting[]>();
  for (const m of meetings) {
    const key = m.event_year ?? null;
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }
  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] == null) return 1;
    if (b[0] == null) return -1;
    return b[0] - a[0];
  });
};

export default function AdminMeetingsPage({
  meetings,
  member,
  selectedYear,
  initialError = '',
}: AdminMeetingsPageProps) {
  const router = useRouter();
  const canEdit = canEditContent(member);
  const groups = groupByEdition(meetings);

  return (
    <AdminLayout title="회의록" member={member}>
      {initialError && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {initialError}
        </p>
      )}

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-deep-ocean/70">기획단 회의 {meetings.length}건</p>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => {
              const v = e.target.value;
              void router.push(v ? `/admin/meetings?year=${v}` : '/admin/meetings');
            }}
            className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
          >
            <option value="">전체 회차</option>
            {CAMP_EDITION_YEARS.map((year) => (
              <option key={year} value={year}>
                {campEditionLabel(year)}
              </option>
            ))}
          </select>
          {canEdit && (
            <Link
              href="/admin/meetings/new"
              className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
            >
              새 회의
            </Link>
          )}
        </div>
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
            <section key={year ?? 'none'}>
              <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">
                {campEditionLabel(year)}
              </h2>
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
  if (!canEditContent(session.member)) {
    return { redirect: { destination: '/admin', permanent: false } };
  }

  const selectedYear =
    typeof context.query.year === 'string' && /^\d{4}$/.test(context.query.year)
      ? context.query.year
      : '';

  const supabase = createSupabaseServerClient(context.req, context.res);
  let query = supabase
    .from('meetings')
    .select('*')
    .order('meeting_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (selectedYear) query = query.eq('event_year', Number(selectedYear));
  const { data, error } = await query;

  return {
    props: {
      meetings: data ?? [],
      member: session.member,
      selectedYear,
      initialError: error?.message ?? '',
    },
  };
};
