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
  const board = await loadBoardBySlug(slug);
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
