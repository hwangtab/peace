import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getAdminSession,
  canEditContent,
  isOwner,
  redirectToAdminLogin,
  redactMember,
} from '@/lib/adminAuth';
import { createSupabaseServiceClient } from '@/lib/supabaseService';
import type { AdminMember } from '@/types/cms';
import type { GalleryImage } from '@/types/gallery';
import { loadGalleryImages } from '@/utils/dataLoader';

interface RecentLog {
  id: string;
  action: string;
  collection: string;
  primary_label: string | null;
  admin_email: string;
  created_at: string;
}
interface RecentPost {
  id: string;
  title: string;
  status: string;
  created_at: string;
  boardName: string;
  boardSlug: string;
  author: string;
}
interface MeetingRow {
  id: string;
  title: string;
  meeting_date: string | null;
}
interface MailRow {
  id: string;
  subject: string;
  from_name: string;
  from_email: string;
  created_at: string;
}

interface AdminHomeProps {
  member: AdminMember;
  canEdit: boolean;
  counts: {
    videos: number;
    gallery: number;
    press: number;
    history: number;
    members: number;
    admins: number;
    posts: number;
    postsHidden: number;
    unreadMail: number;
    upcomingMeetings: number;
  };
  recentLogs: RecentLog[];
  recentPosts: RecentPost[];
  upcomingMeetings: MeetingRow[];
  recentMeeting: MeetingRow | null;
  recentMail: MailRow[];
}

const ACTION_LABEL: Record<string, string> = {
  create: '등록',
  update: '수정',
  hide: '내림',
  restore: '복구',
};
const COLLECTION_LABEL: Record<string, string> = {
  videos: '비디오',
  gallery: '갤러리',
  press: '언론보도',
  content: '콘텐츠',
};

const fmtDate = (iso: string | null): string => {
  if (!iso) return '날짜 미정';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

function StatCard({
  label,
  value,
  sub,
  href,
  highlight = false,
}: {
  label: string;
  value: number;
  sub?: string;
  href?: string;
  highlight?: boolean;
}) {
  const inner = (
    <>
      <span className="text-sm font-medium text-coastal-gray">{label}</span>
      <span
        className={`mt-1 block font-display text-3xl font-bold ${
          highlight && value > 0 ? 'text-sunset-coral' : 'text-deep-ocean'
        }`}
      >
        {value.toLocaleString('ko-KR')}
      </span>
      {sub ? <span className="mt-1 block text-xs text-coastal-gray">{sub}</span> : null}
    </>
  );
  const base =
    'block rounded-lg border border-deep-ocean/10 bg-white p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean';
  return href ? (
    <Link
      href={href}
      className={`${base} hover:-translate-y-0.5 hover:border-jeju-ocean/50 hover:shadow-md`}
    >
      {inner}
    </Link>
  ) : (
    <div className={base}>{inner}</div>
  );
}

function PanelHeader({ title, href, action }: { title: string; href?: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-deep-ocean">{title}</h2>
      {href ? (
        <Link href={href} className="text-xs font-semibold text-jeju-ocean hover:underline">
          {action ?? '전체 보기'} →
        </Link>
      ) : null}
    </div>
  );
}

export default function AdminHomePage({
  member,
  canEdit,
  counts,
  recentLogs,
  recentPosts,
  upcomingMeetings,
  recentMeeting,
  recentMail,
}: AdminHomeProps) {
  const isOwnerMember = isOwner(member);
  const contentTotal = counts.videos + counts.gallery + counts.press;

  return (
    <AdminLayout title="상황판" member={member}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">기획단 상황판</h1>
        <p className="mt-2 text-coastal-gray">
          {member.display_name ? `${member.display_name}님, ` : ''}오늘 기획단 활동 현황을 한눈에
          확인하세요.
        </p>
      </div>

      {/* KPI 스탯 */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="가입 회원"
          value={counts.members}
          sub={`기획단 ${counts.admins}명`}
          href={isOwnerMember ? '/admin/members' : undefined}
        />
        <StatCard
          label="게시글"
          value={counts.posts}
          sub={counts.postsHidden > 0 ? `숨김 ${counts.postsHidden}건` : '숨김 없음'}
          href="/admin/board-posts"
        />
        {canEdit && (
          <StatCard
            label="미답변 문의"
            value={counts.unreadMail}
            sub={counts.unreadMail > 0 ? '확인 필요' : '모두 확인됨'}
            href="/admin/mailbox"
            highlight
          />
        )}
        <StatCard
          label="공개 콘텐츠"
          value={contentTotal}
          sub={`영상 ${counts.videos} · 사진 ${counts.gallery} · 보도 ${counts.press}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 메인 컬럼 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 최근 게시글 */}
          <section className="rounded-lg border border-deep-ocean/10 bg-white p-5">
            <PanelHeader title="최근 게시글" href="/admin/board-posts" action="게시글 관리" />
            {recentPosts.length === 0 ? (
              <p className="py-6 text-center text-sm text-coastal-gray">아직 게시글이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-deep-ocean/10">
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/board/${post.boardSlug}/${post.id}`}
                      target="_blank"
                      className="flex items-center justify-between gap-3 py-2.5 transition hover:text-jeju-ocean"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-ocean">
                        {post.title}
                        {post.status === 'hidden' && (
                          <span className="ml-2 rounded bg-deep-ocean/10 px-1.5 py-0.5 text-xs text-coastal-gray">
                            숨김
                          </span>
                        )}
                      </span>
                      <span className="flex-shrink-0 text-xs text-coastal-gray">
                        {post.boardName} · {post.author || '익명'} · {fmtDate(post.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 최근 변경 이력 (editor 이상 — admin_email 등 내부 정보 포함) */}
          {canEdit && (
            <section className="rounded-lg border border-deep-ocean/10 bg-white p-5">
              <PanelHeader title="최근 활동" href="/admin/history" action="변경 이력" />
              {recentLogs.length === 0 ? (
                <p className="py-6 text-center text-sm text-coastal-gray">
                  아직 기록된 활동이 없습니다.
                </p>
              ) : (
                <ul className="divide-y divide-deep-ocean/10">
                  {recentLogs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate text-deep-ocean">
                        <span className="mr-2 rounded bg-jeju-ocean/10 px-1.5 py-0.5 text-xs font-semibold text-jeju-ocean">
                          {COLLECTION_LABEL[log.collection] ?? log.collection}{' '}
                          {ACTION_LABEL[log.action] ?? log.action}
                        </span>
                        {log.primary_label || '(제목 없음)'}
                      </span>
                      <span className="flex-shrink-0 text-xs text-coastal-gray">
                        {log.admin_email.split('@')[0]} · {fmtDate(log.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 회의 일정 (editor 이상) */}
          {canEdit && (
            <section className="rounded-lg border border-deep-ocean/10 bg-white p-5">
              <PanelHeader title="회의" href="/admin/meetings" action="회의록" />
              {upcomingMeetings.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingMeetings.map((m) => (
                    <li key={m.id} className="rounded bg-jeju-ocean/5 px-3 py-2">
                      <span className="block text-sm font-semibold text-deep-ocean">{m.title}</span>
                      <span className="text-xs text-jeju-ocean">
                        예정 · {fmtDate(m.meeting_date)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-coastal-gray">
                  <p>다가오는 회의가 없습니다.</p>
                  {recentMeeting && (
                    <p className="mt-2 text-xs">
                      최근: {recentMeeting.title} ({fmtDate(recentMeeting.meeting_date)})
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 미답변 문의 (editor 이상 — 발신자 이메일 등 민감 정보 포함) */}
          {canEdit && (
            <section className="rounded-lg border border-deep-ocean/10 bg-white p-5">
              <PanelHeader title="미답변 문의" href="/admin/mailbox" action="메일함" />
              {recentMail.length === 0 ? (
                <p className="text-sm text-coastal-gray">새 문의가 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {recentMail.map((mail) => (
                    <li key={mail.id} className="border-l-2 border-sunset-coral/40 pl-3">
                      <span className="block truncate text-sm font-medium text-deep-ocean">
                        {mail.subject || '(제목 없음)'}
                      </span>
                      <span className="text-xs text-coastal-gray">
                        {mail.from_name || mail.from_email} · {fmtDate(mail.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* 콘텐츠 아카이브 */}
          <section className="rounded-lg border border-deep-ocean/10 bg-white p-5">
            <PanelHeader title="콘텐츠 아카이브" />
            <ul className="space-y-1 text-sm">
              {[
                { href: '/admin/videos', label: '비디오', n: counts.videos },
                { href: '/admin/gallery', label: '갤러리', n: counts.gallery },
                { href: '/admin/press', label: '언론보도', n: counts.press },
              ].map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="flex items-center justify-between rounded px-2 py-1.5 transition hover:bg-ocean-sand/40"
                  >
                    <span className="text-deep-ocean">{c.label}</span>
                    <span className="font-semibold text-jeju-ocean">{c.n}개</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* 바로가기 */}
          <section className="rounded-lg border border-deep-ocean/10 bg-white p-5">
            <PanelHeader title="바로가기" />
            <div className="flex flex-wrap gap-2 text-sm">
              {[
                ...(canEdit
                  ? [
                      { href: '/admin/whitepaper', label: '운영 백서' },
                      { href: '/admin/boards', label: '게시판 설정' },
                      { href: '/admin/history', label: '변경 이력' },
                    ]
                  : []),
                ...(isOwnerMember ? [{ href: '/admin/members', label: '기획단' }] : []),
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded border border-deep-ocean/15 px-3 py-1.5 text-deep-ocean transition hover:border-jeju-ocean hover:text-jeju-ocean"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const supabase = createSupabaseServiceClient();
  // "다가오는 회의" 경계를 한국 시간(KST, UTC+9) 기준 오늘로 계산한다.
  // 서버는 UTC라 toISOString()을 그대로 쓰면 KST 자정~오전 9시에 날짜가 하루 어긋난다.
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const countHead = (table: string) =>
    supabase.from(table).select('id', { count: 'exact', head: true });

  // 갤러리는 정적 json(SSOT)이라 archive_gallery_images 테이블이 없다 — 정적 수를 센다.
  const galleryCount = loadGalleryImages<GalleryImage>().length;

  const [
    videos,
    press,
    history,
    members,
    admins,
    posts,
    postsHidden,
    unreadMail,
    upcomingCount,
    recentLogsRes,
    recentPostsRes,
    upcomingMeetingsRes,
    recentMeetingRes,
    recentMailRes,
  ] = await Promise.all([
    countHead('archive_videos'),
    countHead('archive_press_items'),
    countHead('cms_change_logs'),
    countHead('profiles'),
    supabase.from('admin_members').select('id', { count: 'exact', head: true }).eq('active', true),
    countHead('posts'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'hidden'),
    supabase
      .from('mailbox_messages')
      .select('id', { count: 'exact', head: true })
      .eq('direction', 'inbound')
      .eq('is_read', false),
    supabase
      .from('meetings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('meeting_date', today),
    supabase
      .from('cms_change_logs')
      .select('id,action,collection,primary_label,admin_email,created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('posts')
      .select(
        'id,title,status,created_at,boards(name,slug),profiles!posts_author_id_fkey(nickname)'
      )
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('meetings')
      .select('id,title,meeting_date')
      .eq('status', 'scheduled')
      .gte('meeting_date', today)
      .order('meeting_date', { ascending: true })
      .limit(3),
    supabase
      .from('meetings')
      .select('id,title,meeting_date')
      .eq('status', 'completed')
      .order('meeting_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('mailbox_messages')
      .select('id,subject,from_name,from_email,created_at')
      .eq('direction', 'inbound')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const pickOne = <T,>(rel: T | T[] | null | undefined): T | null =>
    Array.isArray(rel) ? (rel[0] ?? null) : (rel ?? null);

  const recentPosts: RecentPost[] = (
    (recentPostsRes.data as Record<string, unknown>[] | null) ?? []
  ).map((row) => {
    const board = pickOne(row.boards as { name?: string; slug?: string } | null);
    const profile = pickOne(row.profiles as { nickname?: string } | null);
    return {
      id: String(row.id),
      title: String(row.title),
      status: String(row.status),
      created_at: String(row.created_at),
      boardName: board?.name ?? '',
      boardSlug: board?.slug ?? '',
      author: profile?.nickname ?? '',
    };
  });

  // viewer에게는 문의 발신자 이메일·회의·변경 이력 등 내부 정보를 props에 싣지 않는다
  // (UI 숨김만으로는 __NEXT_DATA__에 직렬화되어 노출되므로 서버에서 비운다).
  const canEdit = canEditContent(session.member);

  return {
    props: {
      member: redactMember(session.member),
      canEdit,
      counts: {
        videos: videos.count ?? 0,
        gallery: galleryCount,
        press: press.count ?? 0,
        history: history.count ?? 0,
        members: members.count ?? 0,
        admins: admins.count ?? 0,
        posts: posts.count ?? 0,
        postsHidden: postsHidden.count ?? 0,
        unreadMail: canEdit ? (unreadMail.count ?? 0) : 0,
        upcomingMeetings: canEdit ? (upcomingCount.count ?? 0) : 0,
      },
      recentLogs: canEdit ? ((recentLogsRes.data as RecentLog[] | null) ?? []) : [],
      recentPosts,
      upcomingMeetings: canEdit ? ((upcomingMeetingsRes.data as MeetingRow[] | null) ?? []) : [],
      recentMeeting: canEdit ? ((recentMeetingRes.data as MeetingRow | null) ?? null) : null,
      recentMail: canEdit ? ((recentMailRes.data as MailRow[] | null) ?? []) : [],
    },
  };
}
