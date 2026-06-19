import Link from 'next/link';
import Image from 'next/image';
import type { PostWithMeta } from '@/types/board';
import RatingStars from './RatingStars';

interface PostCardProps {
  post: PostWithMeta;
  boardSlug: string;
}

export default function PostCard({ post, boardSlug }: PostCardProps) {
  const firstImage = post.images.length > 0 ? post.images[0] : null;
  const dateStr = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
        <p className="mt-1 text-sm text-coastal-gray">
          {post.author_nickname} · {dateStr}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm text-coastal-gray">
          <span>♡ {post.like_count}</span>
          {post.rating != null && <RatingStars value={post.rating} />}
        </div>
      </div>
    </Link>
  );
}
