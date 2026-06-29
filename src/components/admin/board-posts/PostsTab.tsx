import type { AdminPostRow, BoardInfo, BoardCounts } from './types';
import { inputCls, selectCls, btnBulk, LIMIT } from './types';
import PostRow from './PostRow';

interface PostsTabProps {
  boards: BoardInfo[];
  boardCounts: BoardCounts;
  canEdit: boolean;
  posts: AdminPostRow[];
  postsTotal: number;
  postsLoading: boolean;
  postsOffset: number;
  postsQ: string;
  postsBoardId: string;
  postsStatus: string;
  selectedPostIds: Set<string>;
  expandedPostIds: Set<string>;
  bulkBusy: boolean;
  busyIds: Set<string>;
  allPostsSelected: boolean;
  onPostsQChange: (val: string) => void;
  onPostsBoardChange: (val: string) => void;
  onPostsStatusChange: (val: string) => void;
  onToggleSelectAll: () => void;
  onTogglePostSelect: (id: string) => void;
  onToggleExpandPost: (id: string) => void;
  onTogglePostStatus: (post: AdminPostRow) => void;
  onDeletePost: (post: AdminPostRow) => void;
  onBulkUpdate: (status: 'published' | 'hidden') => void;
  onPageChange: (dir: -1 | 1) => void;
}

export default function PostsTab({
  boards,
  boardCounts,
  canEdit,
  posts,
  postsTotal,
  postsLoading,
  postsOffset,
  postsQ,
  postsBoardId,
  postsStatus,
  selectedPostIds,
  expandedPostIds,
  bulkBusy,
  busyIds,
  allPostsSelected,
  onPostsQChange,
  onPostsBoardChange,
  onPostsStatusChange,
  onToggleSelectAll,
  onTogglePostSelect,
  onToggleExpandPost,
  onTogglePostStatus,
  onDeletePost,
  onBulkUpdate,
  onPageChange,
}: PostsTabProps) {
  return (
    <>
      {/* Board count chips */}
      {boards.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {boards.map((b) => {
            const cnt = boardCounts[b.id] ?? { published: 0, hidden: 0 };
            return (
              <span
                key={b.id}
                className="rounded-full bg-deep-ocean/5 px-3 py-1 text-xs text-coastal-gray"
              >
                <span className="font-semibold text-deep-ocean">{b.name}</span> 공개&nbsp;
                <span className="font-semibold text-jeju-ocean">{cnt.published}</span>
                &nbsp;·&nbsp;숨김&nbsp;
                <span className="font-semibold text-sunset-coral">{cnt.hidden}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          className={inputCls}
          placeholder="제목 검색"
          value={postsQ}
          onChange={(e) => onPostsQChange(e.target.value)}
        />
        <select
          className={selectCls}
          value={postsBoardId}
          onChange={(e) => onPostsBoardChange(e.target.value)}
        >
          <option value="">전체 게시판</option>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={postsStatus}
          onChange={(e) => onPostsStatusChange(e.target.value)}
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
              checked={allPostsSelected}
              onChange={onToggleSelectAll}
              className="accent-jeju-ocean"
            />
            전체 선택
          </label>
          {selectedPostIds.size > 0 && (
            <>
              <span className="text-sm text-coastal-gray">{selectedPostIds.size}개 선택됨</span>
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

      {/* Posts list */}
      <div className="rounded border border-deep-ocean/10 bg-white">
        {postsLoading ? (
          <p className="p-6 text-sm text-coastal-gray">불러오는 중…</p>
        ) : posts.length === 0 ? (
          <p className="p-6 text-coastal-gray">게시글이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-deep-ocean/10">
            {posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                canEdit={canEdit}
                busy={busyIds.has(post.id)}
                expanded={expandedPostIds.has(post.id)}
                selected={selectedPostIds.has(post.id)}
                onSelect={onTogglePostSelect}
                onToggleExpand={onToggleExpandPost}
                onToggleStatus={onTogglePostStatus}
                onDelete={onDeletePost}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between text-sm text-coastal-gray">
        <span>
          {postsTotal === 0
            ? `총 0건`
            : `${postsOffset + 1}–${Math.min(postsOffset + LIMIT, postsTotal)} / 총 ${postsTotal}건`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={postsOffset === 0 || postsLoading}
            onClick={() => onPageChange(-1)}
            className={btnBulk}
          >
            이전
          </button>
          <button
            type="button"
            disabled={postsOffset + LIMIT >= postsTotal || postsLoading}
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
