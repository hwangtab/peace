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
      void router.replace('/login?next=' + currentPath);
      return;
    }
    // Author gate — non-author redirected to detail
    if (user.id !== post.author_id) {
      void router.replace(`/board/${board.slug}/${post.id}`);
    }
  }, [loading, user, router, post.author_id, post.id, board.slug]);

  // Show nothing while redirecting or auth still loading
  if (loading || !user || user.id !== post.author_id) {
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-deep-ocean">
        {t('post.edit')}
      </h1>
      <PostForm board={board} initial={post} mode="edit" />
    </main>
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
