import type { AdminCommentRow } from '@/types/board';
import { inputCls, selectCls, btnBulk, LIMIT } from './types';
import CommentRow from './CommentRow';

interface CommentsTabProps {
  canEdit: boolean;
  comments: AdminCommentRow[];
  commentsTotal: number;
  commentsLoading: boolean;
  commentsOffset: number;
  commentsQ: string;
  commentsStatus: string;
  selectedCommentIds: Set<string>;
  expandedCommentIds: Set<string>;
  bulkBusy: boolean;
  busyIds: Set<string>;
  allCommentsSelected: boolean;
  onCommentsQChange: (val: string) => void;
  onCommentsStatusChange: (val: string) => void;
  onToggleSelectAll: () => void;
  onToggleCommentSelect: (id: string) => void;
  onToggleExpandComment: (id: string) => void;
  onToggleCommentStatus: (comment: AdminCommentRow) => void;
  onDeleteComment: (comment: AdminCommentRow) => void;
  onBulkUpdate: (status: 'published' | 'hidden') => void;
  onPageChange: (dir: -1 | 1) => void;
}

export default function CommentsTab({
  canEdit,
  comments,
  commentsTotal,
  commentsLoading,
  commentsOffset,
  commentsQ,
  commentsStatus,
  selectedCommentIds,
  expandedCommentIds,
  bulkBusy,
  busyIds,
  allCommentsSelected,
  onCommentsQChange,
  onCommentsStatusChange,
  onToggleSelectAll,
  onToggleCommentSelect,
  onToggleExpandComment,
  onToggleCommentStatus,
  onDeleteComment,
  onBulkUpdate,
  onPageChange,
}: CommentsTabProps) {
  return (
    <>
      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          className={inputCls}
          placeholder="댓글 내용 검색"
          value={commentsQ}
          onChange={(e) => onCommentsQChange(e.target.value)}
        />
        <select
          className={selectCls}
          value={commentsStatus}
          onChange={(e) => onCommentsStatusChange(e.target.value)}
        >
          <option value="">전체</option>
          <option value="published">공개</option>
          <option value="hidden">숨김</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {canEdit && (
        <div className="mb-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-coastal-gray">
            <input
              type="checkbox"
              checked={allCommentsSelected}
              onChange={onToggleSelectAll}
              className="accent-jeju-ocean"
            />
            전체 선택
          </label>
          {selectedCommentIds.size > 0 && (
            <>
              <span className="text-sm text-coastal-gray">{selectedCommentIds.size}개 선택됨</span>
              <button
                type="button"
                disabled={bulkBusy}
                className={btnBulk}
                onClick={() => onBulkUpdate('hidden')}
              >
                {bulkBusy ? '처리 중…' : '일괄 숨김'}
              </button>
              <button
                type="button"
                disabled={bulkBusy}
                className={btnBulk}
                onClick={() => onBulkUpdate('published')}
              >
                {bulkBusy ? '처리 중…' : '일괄 공개'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Comments list */}
      <div className="rounded border border-deep-ocean/10 bg-white">
        {commentsLoading ? (
          <p className="p-6 text-sm text-coastal-gray">불러오는 중…</p>
        ) : comments.length === 0 ? (
          <p className="p-6 text-coastal-gray">댓글이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-deep-ocean/10">
            {comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                canEdit={canEdit}
                busy={busyIds.has(comment.id)}
                expanded={expandedCommentIds.has(comment.id)}
                selected={selectedCommentIds.has(comment.id)}
                onSelect={onToggleCommentSelect}
                onToggleExpand={onToggleExpandComment}
                onToggleStatus={onToggleCommentStatus}
                onDelete={onDeleteComment}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between text-sm text-coastal-gray">
        <span>
          {commentsTotal === 0
            ? `총 0건`
            : `${commentsOffset + 1}–${Math.min(commentsOffset + LIMIT, commentsTotal)} / 총 ${commentsTotal}건`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={commentsOffset === 0 || commentsLoading}
            onClick={() => onPageChange(-1)}
            className={btnBulk}
          >
            이전
          </button>
          <button
            type="button"
            disabled={commentsOffset + LIMIT >= commentsTotal || commentsLoading}
            onClick={() => onPageChange(1)}
            className={btnBulk}
          >
            다음
          </button>
        </div>
      </div>
    </>
  );
}
