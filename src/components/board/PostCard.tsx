import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import type { PostWithMeta } from '@/types/board';
import RatingStars from './RatingStars';
import { formatBoardDate } from '@/lib/boardForms';

interface PostCardProps {
  post: PostWithMeta;
  boardSlug: string;
}

const PostCard = React.memo(function PostCard({ post, boardSlug }: PostCardProps) {
  const { t } = useTranslation('board');
  const firstImage = post.images.length > 0 ? post.images[0] : null;
  const dateStr = formatBoardDate(post.created_at);

  return (
    <Link
      href={`/board/${boardSlug}/${post.id}`}
      className="flex gap-4 rounded-xl border border-seafoam bg-cloud-white p-4 shadow-sm transition hover:shadow-md"
    >
      {firstImage && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={firstImage.image_url}
            alt={post.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-deep-ocean">{post.title}</p>
        {post.body && <p className="mt-1 line-clamp-2 text-sm text-coastal-gray">{post.body}</p>}
        <p className="mt-2 text-sm text-coastal-gray">
          {post.author_nickname || t('post.anonymous')} · {dateStr}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm text-coastal-gray">
          <span>♡ {post.like_count}</span>
          <span>💬 {post.comment_count}</span>
          <span>👁 {post.view_count}</span>
          {post.rating != null && <RatingStars value={post.rating} />}
        </div>
      </div>
    </Link>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;
