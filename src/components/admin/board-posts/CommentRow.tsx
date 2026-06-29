import type { AdminCommentRow } from '@/types/board';
import { btnHide, btnShow, btnDanger, btnLink, fmt } from './types';

interface CommentRowProps {
  comment: AdminCommentRow;
  canEdit: boolean;
  busy: boolean;
  expanded: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleStatus: (comment: AdminCommentRow) => void;
  onDelete: (comment: AdminCommentRow) => void;
}

export default function CommentRow({
  comment,
  canEdit,
  busy,
  expanded,
  selected,
  onSelect,
  onToggleExpand,
  onToggleStatus,
  onDelete,
}: CommentRowProps) {
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-start gap-3">
        {/* Checkbox */}
        {canEdit && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(comment.id)}
            className="mt-1 accent-jeju-ocean"
          />
        )}

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => onToggleExpand(comment.id)}
          className="mt-0.5 text-xs text-coastal-gray hover:text-deep-ocean focus-visible:outline-none"
          aria-expanded={expanded}
          aria-label={expanded ? '내용 접기' : '내용 펼치기'}
        >
          {expanded ? '▲' : '▼'}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-deep-ocean">
            {comment.body.length > 80 ? comment.body.slice(0, 80) + '…' : comment.body}
          </p>
          <p className="mt-0.5 text-xs text-coastal-gray">
            <span>{comment.author_nickname}</span>
            &nbsp;·&nbsp;
            <span>글: {comment.post_title}</span>
            &nbsp;·&nbsp;
            <span>{fmt.format(new Date(comment.created_at))}</span>
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            comment.status === 'published'
              ? 'bg-jeju-ocean/10 text-jeju-ocean'
              : 'bg-sunset-coral/10 text-sunset-coral'
          }`}
        >
          {comment.status === 'published' ? '공개' : '숨김'}
        </span>

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleStatus(comment)}
              className={comment.status === 'published' ? btnHide : btnShow}
            >
              {busy ? '…' : comment.status === 'published' ? '숨김' : '공개'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(comment)}
              className={btnDanger}
            >
              영구삭제
            </button>
            {comment.post_board_slug && (
              <a
                href={`/board/${comment.post_board_slug}/${comment.post_id}`}
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
            {comment.body || '(내용 없음)'}
          </p>
        </div>
      )}
    </li>
  );
}
