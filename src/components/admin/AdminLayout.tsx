import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { canEditContent } from '@/lib/adminAuth';
import type { AdminMember } from '@/types/cms';
import NotificationBell from '@/components/admin/NotificationBell';

// 비디오·갤러리·언론보도는 정적 json(SSOT)으로 전환되어 어드민 CMS 편집이
// 공개 사이트에 반영되지 않는다. 혼란 방지를 위해 아카이브 편집 메뉴를 모두 제거했다.
// (콘텐츠 갱신은 정적 json 수정·커밋으로만 반영. 참조: [[project_gallery_static_ssot]])
const NAV_ITEMS = [
  { href: '/admin', label: '상황판' },
  { href: '/admin/whitepaper', label: '운영 백서' },
  { href: '/admin/meetings', label: '회의록' },
  { href: '/admin/mailbox', label: '메일함' },
  { href: '/admin/boards', label: '게시판' },
  { href: '/admin/board-posts', label: '게시글 관리' },
  { href: '/admin/history', label: '변경 이력' },
];

const OWNER_NAV_ITEMS = [{ href: '/admin/members', label: '기획단' }];

interface AdminLayoutProps {
  title: string;
  member?: AdminMember;
  children: ReactNode;
}

export default function AdminLayout({ title, member, children }: AdminLayoutProps) {
  const router = useRouter();
  const navItems = member?.role === 'owner' ? [...NAV_ITEMS, ...OWNER_NAV_ITEMS] : NAV_ITEMS;

  const handleSignOut = async () => {
    try {
      await createSupabaseBrowserClient().auth.signOut();
    } catch (err) {
      // 세션 종료 실패해도 로그인 페이지로 보내 사용자가 다시 시도하게 한다.
      console.error('[AdminLayout] signOut failed:', err);
    }
    await router.push('/login');
  };

  return (
    <>
      <Head>
        <title>{title} | PEACE 기획단</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen bg-[#f5f7f2] text-deep-ocean">
        <header className="border-b border-deep-ocean/10 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/admin"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
              >
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-jeju-ocean">
                  PEACE CMS
                </span>
                <span className="font-display text-2xl font-bold">기획단 페이지</span>
              </Link>
              <div className="flex items-center gap-3 text-sm">
                {member && (
                  <span className="hidden text-coastal-gray sm:inline">
                    {member.display_name || member.email}
                  </span>
                )}
                {/* 알림 API(/api/admin/notifications)는 editor 이상만 허용 —
                    viewer에게는 죽은 벨·무의미한 403 폴링만 남으므로 렌더하지 않는다. */}
                {member && canEditContent(member) && <NotificationBell />}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded border border-deep-ocean/20 bg-white px-3 py-2 font-medium text-deep-ocean transition hover:border-jeju-ocean hover:text-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
                >
                  로그아웃
                </button>
              </div>
            </div>
            <nav aria-label="관리자 메뉴" className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const active = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={classNames(
                      'whitespace-nowrap rounded px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean',
                      active
                        ? 'bg-deep-ocean text-white'
                        : 'bg-white text-deep-ocean hover:bg-jeju-ocean/10'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </>
  );
}
