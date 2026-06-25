import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../next-i18next.config';
import {
  loadBoardBySlug,
  loadBoardPosts,
  loadBoardPostCount,
  type BoardSort,
} from '@/lib/boardData';
import type { Board, PostWithMeta } from '@/types/board';
import PostCard from '@/components/board/PostCard';
import { useOptionalAuth } from '@/components/auth/AuthProvider';
import PageHero from '@/components/common/PageHero';

// 게시판 히어로 배경은 관리자에서 게시판별로 지정한다(boards.hero_image_url).
// 비어 있으면 아래 폴백 이미지를 쓴다.
const BOARD_DETAIL_HERO_FALLBACK = '/images-webp/camps/2025/DSC00798.webp';

const PAGE_SIZE = 20;

interface Props {
  board: Board;
  posts: PostWithMeta[];
  hasMore: boolean;
  offset: number;
  total: number;
  q: string;
  sort: BoardSort;
}

export default function BoardSlugPage({ board, posts, hasMore, offset, total, q, sort }: Props) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const auth = useOptionalAuth();
  const isLoggedIn = Boolean(auth?.user);

  const [searchInput, setSearchInput] = useState(q);

  const nextOffset = offset + PAGE_SIZE;
  const prevOffset = Math.max(0, offset - PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const basePath = `/board/${board.slug}`;

  // 검색어(q)·정렬(sort)을 유지한 채 offset만 바꾸는 페이지 링크.
  const pageHref = (newOffset: number) => ({
    pathname: basePath,
    query: {
      ...(q ? { q } : {}),
      ...(sort !== 'latest' ? { sort } : {}),
      ...(newOffset > 0 ? { offset: String(newOffset) } : {}),
    },
  });

  // 정렬 변경 — 검색어는 유지하되 페이지는 1로 리셋(offset 제거).
  const sortHref = (newSort: BoardSort) => ({
    pathname: basePath,
    query: { ...(q ? { q } : {}), ...(newSort !== 'latest' ? { sort: newSort } : {}) },
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = searchInput.trim();
    void router.push({
      pathname: basePath,
      query: { ...(next ? { q: next } : {}), ...(sort !== 'latest' ? { sort } : {}) },
    });
  };

  const sortLinkCls = (active: boolean) =>
    active ? 'font-bold text-jeju-ocean' : 'text-coastal-gray hover:text-jeju-ocean';

  return (
    <>
      <PageHero
        compact
        title={board.name}
        backgroundImage={board.hero_image_url ?? BOARD_DETAIL_HERO_FALLBACK}
      />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/board" className="text-sm text-coastal-gray hover:underline">
              ← {t('index.title')}
            </Link>
            {board.description && (
              <p className="mt-1 text-sm text-coastal-gray">{board.description}</p>
            )}
            <p className="mt-1 text-xs text-coastal-gray">
              {total} {t('index.posts')}
            </p>
          </div>
          {!auth?.loading &&
            (isLoggedIn ? (
              <Link
                href={`/board/${board.slug}/new`}
                className="flex-shrink-0 rounded-lg bg-jeju-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-deep-ocean"
              >
                {t('index.writeCta')}
              </Link>
            ) : (
              <Link
                href={`/login?next=/board/${board.slug}/new`}
                className="flex-shrink-0 rounded-lg border border-jeju-ocean px-4 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam"
              >
                {t('index.loginToWrite')}
              </Link>
            ))}
        </div>

        {/* Search + sort controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={onSearch} className="flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('list.searchPlaceholder')}
              aria-label={t('list.searchPlaceholder')}
              className="w-full rounded-lg border border-seafoam px-3 py-1.5 text-sm text-deep-ocean focus:border-jeju-ocean focus:outline-none sm:w-56"
            />
            <button
              type="submit"
              className="flex-shrink-0 rounded-lg bg-jeju-ocean px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-deep-ocean"
            >
              {t('list.search')}
            </button>
          </form>
          <div className="flex flex-shrink-0 items-center gap-2 text-sm">
            <Link href={sortHref('latest')} className={sortLinkCls(sort === 'latest')}>
              {t('list.sortLatest')}
            </Link>
            <span className="text-coastal-gray/40">|</span>
            <Link href={sortHref('popular')} className={sortLinkCls(sort === 'popular')}>
              {t('list.sortPopular')}
            </Link>
          </div>
        </div>

        {q && (
          <p className="mb-4 text-sm text-coastal-gray">
            “{q}”{' · '}
            <Link
              href={{
                pathname: basePath,
                query: { ...(sort !== 'latest' ? { sort } : {}) },
              }}
              className="text-jeju-ocean underline hover:opacity-80"
            >
              {t('list.clearSearch')}
            </Link>
          </p>
        )}

        {posts.length === 0 ? (
          <p className="text-coastal-gray">{q ? t('list.noResults') : t('list.empty')}</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} boardSlug={board.slug} />
              </li>
            ))}
          </ul>
        )}

        {(offset > 0 || hasMore) && (
          <div className="mt-8 flex items-center justify-between gap-4">
            {offset > 0 ? (
              <Link
                href={pageHref(prevOffset)}
                className="rounded-lg border border-jeju-ocean px-5 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam"
              >
                ← {t('list.prev')}
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="text-sm text-coastal-gray">
              {currentPage} / {totalPages}
            </span>
            {hasMore ? (
              <Link
                href={pageHref(nextOffset)}
                className="rounded-lg border border-jeju-ocean px-5 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam"
              >
                {t('list.next')} →
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps = async ({ locale, params, query }: GetServerSidePropsContext) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const rawOffset = Math.max(
    0,
    parseInt(typeof query.offset === 'string' ? query.offset : '0', 10) || 0
  );
  const offset = Math.floor(rawOffset / PAGE_SIZE) * PAGE_SIZE;
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
  const sort: BoardSort = query.sort === 'popular' ? 'popular' : 'latest';

  const board = await loadBoardBySlug(slug);
  if (!board) return { notFound: true };

  const [{ items: posts, hasMore }, total] = await Promise.all([
    loadBoardPosts(board.id, { limit: PAGE_SIZE, offset, keyword: q, sort }),
    loadBoardPostCount(board.id, q),
  ]);

  return {
    props: {
      board,
      posts,
      hasMore,
      offset,
      total,
      q,
      sort,
      ...(await serverSideTranslations(
        locale ?? 'ko',
        ['board', 'translation'],
        nextI18NextConfig
      )),
    },
  };
};
