import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../../next-i18next.config';
import { loadBoardBySlug, loadPostDetailWithClient } from '@/lib/boardData';
import { safeRedirectPath } from '@/lib/memberAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import PostForm from '@/components/board/PostForm';
import type { Board, PostWithMeta } from '@/types/board';
import PageHero from '@/components/common/PageHero';

const BOARD_EDIT_HERO = '/images-webp/camps/2025/DSC00995.webp';

interface Props {
  board: Board;
  post: PostWithMeta;
}

export default function EditPostPage({ board, post }: Props) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const { user, loading } = useAuth();

  // Client login gate
  useEffect(() => {
    if (loading) return;
    if (!user) {
      const currentPath = safeRedirectPath(router.asPath);
      void router.replace('/login?next=' + encodeURIComponent(currentPath));
      return;
    }
    // Author gate — non-author redirected to detail
    if (user.id !== post.author_id) {
      void router.replace(`/board/${board.slug}/${post.id}`);
    }
  }, [loading, user, router, post.author_id, post.id, board.slug]);

  // While redirecting or resolving auth, keep the hero so the header stays
  // visible (it is transparent over the page background) instead of a blank screen.
  if (loading || !user || user.id !== post.author_id) {
    return (
      <>
        <PageHero compact title={t('post.edit')} backgroundImage={BOARD_EDIT_HERO} />
        <main className="mx-auto max-w-2xl px-4 py-12" aria-hidden="true">
          <div className="h-64 animate-pulse rounded-lg bg-seafoam/40" />
        </main>
      </>
    );
  }

  return (
    <>
      <PageHero compact title={t('post.edit')} backgroundImage={BOARD_EDIT_HERO} />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <PostForm board={board} initial={post} mode="edit" />
      </main>
    </>
  );
}

export const getServerSideProps = async ({
  locale,
  params,
  req,
  res,
}: GetServerSidePropsContext) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const postId = typeof params?.postId === 'string' ? params.postId : '';

  const serverClient = createSupabaseServerClient(req, res);
  const [board, post] = await Promise.all([
    loadBoardBySlug(slug),
    loadPostDetailWithClient(serverClient, postId),
  ]);

  if (!board || !post) return { notFound: true };

  // Validate that the post belongs to the URL slug
  if (post.board_id !== board.id) return { notFound: true };

  return {
    props: {
      board,
      post,
      ...(await serverSideTranslations(
        locale ?? 'ko',
        ['board', 'translation'],
        nextI18NextConfig
      )),
    },
  };
};
