import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../next-i18next.config';
import { loadBoardBySlug } from '@/lib/boardData';
import { safeRedirectPath } from '@/lib/memberAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import PostForm from '@/components/board/PostForm';
import type { Board } from '@/types/board';
import PageHero from '@/components/common/PageHero';
import SEOHelmet from '@/components/shared/SEOHelmet';

const BOARD_NEW_HERO = '/images-webp/camps/2025/DSC00716.webp';

interface Props {
  board: Board;
}

export default function NewPostPage({ board }: Props) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const { user, loading } = useAuth();

  // Client login gate
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = safeRedirectPath(router.asPath);
      void router.replace('/login?next=' + encodeURIComponent(currentPath));
    }
  }, [loading, user, router]);

  // While redirecting or resolving auth, keep the hero so the header stays
  // visible (it is transparent over the page background) instead of a blank screen.
  if (loading || !user) {
    return (
      <>
        <SEOHelmet title={`${board.name} — ${t('list.newPost')}`} noIndex />
        <PageHero
          compact
          title={`${board.name} — ${t('list.newPost')}`}
          backgroundImage={BOARD_NEW_HERO}
        />
        <main className="mx-auto max-w-2xl px-4 py-12" aria-hidden="true">
          <div className="h-64 animate-pulse rounded-lg bg-seafoam/40" />
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHelmet title={`${board.name} — ${t('list.newPost')}`} noIndex />
      <PageHero
        compact
        title={`${board.name} — ${t('list.newPost')}`}
        backgroundImage={BOARD_NEW_HERO}
      />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <PostForm board={board} mode="create" />
      </main>
    </>
  );
}

export const getServerSideProps = async ({ locale, params }: GetServerSidePropsContext) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  let board;
  try {
    board = await loadBoardBySlug(slug);
  } catch {
    // 데이터 소스 장애 시 raw 500 대신 게시판으로 보내 안내를 노출한다(어차피 인증도 불가).
    return { redirect: { destination: `/board/${slug}`, permanent: false } };
  }
  if (!board) return { notFound: true };

  return {
    props: {
      board,
      ...(await serverSideTranslations(
        locale ?? 'ko',
        ['board', 'translation'],
        nextI18NextConfig
      )),
    },
  };
};
