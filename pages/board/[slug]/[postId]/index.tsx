import { useEffect, useState } from 'react';
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
import SEOHelmet from '@/components/shared/SEOHelmet';
import dynamic from 'next/dynamic';
import type { LightboxImage } from '@/components/common/ImageLightbox';
// 라이트박스·삭제 확인 다이얼로그는 클릭 시점에만 필요 — 초기 번들에서 분리.
const ImageLightbox = dynamic(() => import('@/components/common/ImageLightbox'), { ssr: false });
const ConfirmDialog = dynamic(() => import('@/components/common/ConfirmDialog'), { ssr: false });

const BOARD_POST_HERO = '/images-webp/camps/2025/DSC00700.webp';

interface Props {
  post: PostWithMeta;
  slug: string;
  comments: CommentRow[];
  commentsHasMore: boolean;
}

export default function PostDetailPage({ post, slug, comments, commentsHasMore }: Props) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const auth = useOptionalAuth();
  const isAuthor = !auth?.loading && auth?.user?.id === post.author_id;

  const dateStr = formatBoardDate(post.created_at);

  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 조회수 증가 — 세션당 글 1회만(새로고침 인플레이션 방지), 클라이언트에서만 호출.
  // 표시값은 로드 시점(post.view_count) 기준이며, 증가분은 다음 방문/새로고침에 반영된다.
  useEffect(() => {
    if (post.status !== 'published') return;
    const key = `viewed:${post.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage 사용 불가 — 그대로 증가 시도
    }
    const supabase = createSupabaseBrowserClient();
    void supabase.rpc('increment_post_view', { p_post_id: post.id });
  }, [post.id, post.status]);

  const performDelete = async () => {
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();
    // Delete post from DB first — if this fails, don't remove storage or redirect
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', post.id);
    if (deleteError) {
      setDeleting(false);
      setShowDeleteConfirm(false);
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

  // 본문 앞부분을 메타 설명으로(줄바꿈 정리 후 ~155자).
  const metaDescription = post.body.replace(/\s+/g, ' ').trim().slice(0, 155);

  return (
    <>
      {/* 게시판은 회원 전용 커뮤니티로 검색엔진과 분리한다(전체 noindex). */}
      <SEOHelmet
        title={post.title}
        description={metaDescription}
        ogType="article"
        datePublished={post.created_at}
        noIndex
      />
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
          <span>·</span>
          <span>👁 {post.view_count}</span>
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
              onClick={() => setShowDeleteConfirm(true)}
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
              {post.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setLightbox(img.image_url)}
                  aria-label={t('post.imageAlt', { n: i + 1 })}
                  className="relative aspect-square overflow-hidden rounded-xl border border-seafoam transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
                >
                  <Image
                    src={img.image_url}
                    alt={t('post.imageAlt', { n: i + 1 })}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* LikeButton — suppressed for hidden posts */}
        {!isHidden && <LikeButton postId={post.id} initialCount={post.like_count} />}

        {/* CommentSection — read-only for hidden posts (no add-comment form) */}
        <CommentSection
          postId={post.id}
          initialComments={comments}
          initialHasMore={commentsHasMore}
          readOnly={isHidden}
        />
      </main>

      <ImageLightbox
        show={lightbox !== null}
        images={lightbox ? ([{ src: lightbox, alt: post.title }] satisfies LightboxImage[]) : []}
        index={0}
        onIndexChange={() => {}}
        onClose={() => setLightbox(null)}
      />

      <ConfirmDialog
        show={showDeleteConfirm}
        message={t('post.deleteConfirm')}
        confirmLabel={t('post.delete')}
        cancelLabel={t('post.cancel')}
        busy={deleting}
        onConfirm={() => {
          void performDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
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

  const { items: recentComments, hasMore: commentsHasMore } = await loadPostCommentsWithClient(
    serverClient,
    postId
  );
  // Most-recent page comes back newest-first; reverse for ascending conversation order.
  const comments = recentComments.slice().reverse();

  return {
    props: {
      post,
      slug,
      comments,
      commentsHasMore,
      ...(await serverSideTranslations(
        locale ?? 'ko',
        ['board', 'translation'],
        nextI18NextConfig
      )),
    },
  };
};
