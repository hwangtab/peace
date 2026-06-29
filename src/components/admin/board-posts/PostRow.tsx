import type { AdminPostRow } from './types';
import { btnHide, btnShow, btnDanger, btnLink, fmt } from './types';

interface PostRowProps {
  post: AdminPostRow;
  canEdit: boolean;
  busy: boolean;
  expanded: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleStatus: (post: AdminPostRow) => void;
  onDelete: (post: AdminPostRow) => void;
}

export default function PostRow({
  post,
  canEdit,
  busy,
  expanded,
  selected,
  onSelect,
  onToggleExpand,
  onToggleStatus,
  onDelete,
}: PostRowProps) {
  const sortedImages = post.post_images.slice().sort((a, b) => a.sort_order - b.sort_order);

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-start gap-3">
        {/* Checkbox */}
        {canEdit && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(post.id)}
            className="mt-1 accent-jeju-ocean"
          />
        )}

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => onToggleExpand(post.id)}
          className="mt-0.5 text-xs text-coastal-gray hover:text-deep-ocean focus-visible:outline-none"
          aria-expanded={expanded}
          aria-label={expanded ? '내용 접기' : '내용 펼치기'}
        >
          {expanded ? '▲' : '▼'}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{post.title}</p>
          <p className="mt-0.5 text-xs text-coastal-gray">
            <span>{post.boards?.name ?? post.board_id}</span>
            &nbsp;·&nbsp;
            <span>{post.profiles?.nickname ?? '익명'}</span>
            &nbsp;·&nbsp;
            <span>{fmt.format(new Date(post.created_at))}</span>
            &nbsp;·&nbsp;
            <span>♡{post.like_count}</span>
            &nbsp;
            <span>💬{post.comment_count}</span>
            &nbsp;
            <span>👁{post.view_count}</span>
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            post.status === 'published'
              ? 'bg-jeju-ocean/10 text-jeju-ocean'
              : 'bg-sunset-coral/10 text-sunset-coral'
          }`}
        >
          {post.status === 'published' ? '공개' : '숨김'}
        </span>

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleStatus(post)}
              className={post.status === 'published' ? btnHide : btnShow}
            >
              {busy ? '…' : post.status === 'published' ? '숨김' : '공개'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(post)}
              className={btnDanger}
            >
              영구삭제
            </button>
            {post.boards?.slug && (
              <a
                href={`/board/${post.boards.slug}/${post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={btnLink}
              >
                원문 열기
              </a>
            )}
          </div>
        )}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="mt-3 rounded bg-deep-ocean/5 p-3">
          <p className="whitespace-pre-wrap text-sm text-deep-ocean">
            {post.body || '(본문 없음)'}
          </p>
          {sortedImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {sortedImages.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${img.image_url}-${i}`}
                  src={img.image_url}
                  alt={`이미지 ${i + 1}`}
                  className="h-20 w-20 rounded object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
