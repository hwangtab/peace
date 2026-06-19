import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../../next-i18next.config';
import { loadPostDetailWithClient, loadPostComments, boardImagePath } from '@/lib/boardData';
import { formatBoardDate } from '@/lib/boardForms';
import type { PostWithMeta } from '@/types/board';
import CommentSection from '@/components/board/CommentSection';
import type { CommentRow } from '@/components/board/CommentSection';
import RatingStars from '@/components/board/RatingStars';
import LikeButton from '@/components/board/LikeButton';
import { useOptionalAuth } from '@/components/auth/AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

interface Props {
  post: PostWithMeta;
  slug: string;
  comments: CommentRow[];
}

export default function PostDetailPage({ post, slug, comments }: Props) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const auth = useOptionalAuth();
  const isAuthor = auth?.user?.id === post.author_id;

  const dateStr = formatBoardDate(post.created_at);

  const handleDelete = async () => {
    if (!window.confirm(t('post.deleteConfirm'))) return;
    const supabase = createSupabaseBrowserClient();
    // Remove storage objects for post images (best-effort)
    const storagePaths = post.images
      .map((img) => boardImagePath(img.image_url))
      .filter((p): p is string => p !== null);
    if (storagePaths.length > 0) {
      await supabase.storage.from('board-images').remove(storagePaths);
    }
    await supabase.from('posts').delete().eq('id', post.id);
    await router.push('/board/' + slug);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* Back link */}
      <Link href={`/board/${slug}`} className="text-sm text-coastal-gray hover:underline">
        ←{' '}
        {t('index.title')}
      </Link>

      {/* Post header */}
      <h1 className="mt-4 text-2xl font-bold text-deep-ocean">{post.title}</h1>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-coastal-gray">
        <span>{post.author_nickname || t('post.anonymous')}</span>
        <span>·</span>
        <span>{dateStr}</span>
        {post.rating != null && (
          <>
            <span>·</span>
            <RatingStars value={post.rating} />
          </>
        )}
      </div>

      {/* Author actions */}
      {isAuthor && (
        <div className="mt-4 flex gap-3">
          <Link
            href={`/board/${slug}/${post.id}/edit`}
            className="rounded-lg border border-jeju-ocean px-4 py-1.5 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam"
          >
            {t('post.edit')}
          </Link>
          <button
            type="button"
            onClick={() => { void handleDelete(); }}
            className="rounded-lg border border-red-400 px-4 py-1.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            {t('post.delete')}
          </button>
        </div>
      )}

      {/* Post body */}
      <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-deep-ocean">
        {post.body}
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-coastal-gray">
            {t('post.images')}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {post.images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-seafoam"
              >
                <Image
                  src={img.image_url}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LikeButton */}
      <LikeButton postId={post.id} initialCount={post.like_count} />

      {/* CommentSection */}
      <CommentSection postId={post.id} initialComments={comments} />
    </main>
  );
}

export const getServerSideProps = async ({
  locale,
  params,
  req,
  res,
}: GetServerSidePropsContext) => {
  const postId = typeof params?.postId === 'string' ? params.postId : '';
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const serverClient = createSupabaseServerClient(req, res);
  const post = await loadPostDetailWithClient(serverClient, postId);
  if (!post) return { notFound: true };

  const comments = await loadPostComments(postId);

  return {
    props: {
      post,
      slug,
      comments,
      ...(await serverSideTranslations(
        locale ?? 'ko',
        ['board', 'translation'],
        nextI18NextConfig
      )),
    },
  };
};
