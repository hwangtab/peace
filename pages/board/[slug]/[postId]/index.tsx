import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../../next-i18next.config';
import {
  loadPostDetailWithClient,
  loadPostCommentsWithClient,
  boardImagePath,
} from '@/lib/boardData';
import { formatBoardDate } from '@/lib/boardForms';
import type { PostWithMeta } from '@/types/board';
import CommentSection from '@/components/board/CommentSection';
import type { CommentRow } from '@/components/board/CommentSection';
import RatingStars from '@/components/board/RatingStars';
import LikeButton from '@/components/board/LikeButton';
import { useOptionalAuth } from '@/components/auth/AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import PageHero from '@/components/common/PageHero';

const BOARD_POST_HERO = '/images-webp/camps/2025/DSC00700.webp';

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
    // Delete post from DB first — if this fails, don't remove storage or redirect
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', post.id);
    if (deleteError) {
      alert(t('error.saveFailed'));
      return;
    }
    // Remove storage objects for post images (best-effort, ignore errors)
    const storagePaths = post.images
      .map((img) => boardImagePath(img.image_url))
      .filter((p): p is string => p !== null);
    if (storagePaths.length > 0) {
      void supabase.storage.from('board-images').remove(storagePaths);
    }
    await router.push('/board/' + slug);
  };

  const isHidden = post.status === 'hidden';

  return (
    <>
      <PageHero compact title={post.title} backgroundImage={BOARD_POST_HERO} />
      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Hidden-post notice */}
        {isHidden && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t('post.hiddenNotice')}
          </div>
        )}

        {/* Back link */}
        <Link href={`/board/${slug}`} className="text-sm text-coastal-gray hover:underline">
          ← {t('index.title')}
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-coastal-gray">
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
              onClick={() => {
                void handleDelete();
              }}
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

        {/* LikeButton — suppressed for hidden posts */}
        {!isHidden && <LikeButton postId={post.id} initialCount={post.like_count} />}

        {/* CommentSection — read-only for hidden posts (no add-comment form) */}
        <CommentSection postId={post.id} initialComments={comments} readOnly={isHidden} />
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
  const postId = typeof params?.postId === 'string' ? params.postId : '';
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const serverClient = createSupabaseServerClient(req, res);
  const post = await loadPostDetailWithClient(serverClient, postId);
  if (!post) return { notFound: true };

  // Validate that the post belongs to the URL slug
  if (post.board_slug !== slug) return { notFound: true };

  const comments = await loadPostCommentsWithClient(serverClient, postId);

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
