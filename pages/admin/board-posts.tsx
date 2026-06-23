import { useCallback, useEffect, useRef, useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AdminMember } from '@/types/cms';
import type { AdminCommentRow, Board } from '@/types/board';

// ── Types ────────────────────────────────────────────────────────────────────

interface PostImageRow {
  image_url: string;
  sort_order: number;
}

interface AdminPostRow {
  id: string;
  title: string;
  body: string;
  board_id: string;
  status: 'published' | 'hidden';
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  boards: { slug: string; name: string } | null;
  profiles: { nickname: string } | null;
  post_images: PostImageRow[];
}

type BoardInfo = Pick<Board, 'id' | 'slug' | 'name'>;
type BoardCounts = Record<string, { published: number; hidden: number }>;

interface PageProps {
  boards: BoardInfo[];
  boardCounts: BoardCounts;
  member: AdminMember;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const btnHide =
  'rounded border border-sunset-coral/50 bg-white px-2.5 py-1 text-xs font-semibold text-sunset-coral transition hover:bg-sunset-coral/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-coral';
const btnShow =
  'rounded border border-jeju-ocean/50 bg-white px-2.5 py-1 text-xs font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean';
const btnDanger =
  'rounded border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400';
const btnLink =
  'rounded border border-deep-ocean/20 bg-white px-2.5 py-1 text-xs font-semibold text-deep-ocean/70 transition hover:bg-deep-ocean/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-ocean/40';
const inputCls =
  'rounded border border-deep-ocean/20 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jeju-ocean/40';
const selectCls =
  'rounded border border-deep-ocean/20 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jeju-ocean/40';
const btnBulk =
  'rounded border border-deep-ocean/20 bg-white px-3 py-1.5 text-xs font-semibold text-deep-ocean transition hover:bg-deep-ocean/5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-ocean/40';

const LIMIT = 30;
const fmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminBoardPostsPage({ boards, boardCounts, member }: PageProps) {
  const canEdit = canEditContent(member);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Posts state
  const [postsQ, setPostsQ] = useState('');
  const [postsBoardId, setPostsBoardId] = useState('');
  const [postsStatus, setPostsStatus] = useState('');
  const [postsOffset, setPostsOffset] = useState(0);
  const [posts, setPosts] = useState<AdminPostRow[]>([]);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());

  // Comments state
  const [commentsQ, setCommentsQ] = useState('');
  const [commentsStatus, setCommentsStatus] = useState('');
  const [commentsOffset, setCommentsOffset] = useState(0);
  const [comments, setComments] = useState<AdminCommentRow[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [selectedCommentIds, setSelectedCommentIds] = useState<Set<string>>(new Set());
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set());

  // Busy tracking for row-level actions
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const setBusy = (id: string, on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  // Debounce timer refs
  const postsQTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commentsQTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch posts ──────────────────────────────────────────────────────────
  const fetchPosts = useCallback(
    async (offset: number, q: string, boardId: string, status: string) => {
      setPostsLoading(true);
      const params = new URLSearchParams({ offset: String(offset), limit: String(LIMIT) });
      if (q) params.set('q', q);
      if (boardId) params.set('boardId', boardId);
      if (status) params.set('status', status);
      try {
        const res = await fetch(`/api/admin/board-posts?${params.toString()}`);
        if (!res.ok) {
          const j = (await res.json()) as { error?: string };
          setError(j.error ?? '게시글을 불러오지 못했습니다.');
          return;
        }
        const j = (await res.json()) as { posts: AdminPostRow[]; total: number };
        setPosts(j.posts);
        setPostsTotal(j.total);
        setSelectedPostIds(new Set());
      } catch {
        setError('게시글을 불러오지 못했습니다.');
      } finally {
        setPostsLoading(false);
      }
    },
    []
  );

  // ── Fetch comments ───────────────────────────────────────────────────────
  const fetchComments = useCallback(async (offset: number, q: string, status: string) => {
    setCommentsLoading(true);
    const params = new URLSearchParams({ offset: String(offset), limit: String(LIMIT) });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    try {
      const res = await fetch(`/api/admin/board-comments?${params.toString()}`);
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error ?? '댓글을 불러오지 못했습니다.');
        return;
      }
      const j = (await res.json()) as { comments: AdminCommentRow[]; total: number };
      setComments(j.comments);
      setCommentsTotal(j.total);
      setSelectedCommentIds(new Set());
    } catch {
      setError('댓글을 불러오지 못했습니다.');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPosts(0, '', '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'comments' && comments.length === 0 && commentsTotal === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchComments(0, '', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Filter handlers ──────────────────────────────────────────────────────
  const handlePostsQChange = (val: string) => {
    setPostsQ(val);
    if (postsQTimer.current) clearTimeout(postsQTimer.current);
    postsQTimer.current = setTimeout(() => {
      setPostsOffset(0);
      void fetchPosts(0, val, postsBoardId, postsStatus);
    }, 400);
  };

  const handlePostsBoardChange = (val: string) => {
    setPostsBoardId(val);
    setPostsOffset(0);
    void fetchPosts(0, postsQ, val, postsStatus);
  };

  const handlePostsStatusChange = (val: string) => {
    setPostsStatus(val);
    setPostsOffset(0);
    void fetchPosts(0, postsQ, postsBoardId, val);
  };

  const handleCommentsQChange = (val: string) => {
    setCommentsQ(val);
    if (commentsQTimer.current) clearTimeout(commentsQTimer.current);
    commentsQTimer.current = setTimeout(() => {
      setCommentsOffset(0);
      void fetchComments(0, val, commentsStatus);
    }, 400);
  };

  const handleCommentsStatusChange = (val: string) => {
    setCommentsStatus(val);
    setCommentsOffset(0);
    void fetchComments(0, commentsQ, val);
  };

  // ── Pagination ───────────────────────────────────────────────────────────
  const goPostsPage = (dir: -1 | 1) => {
    const next = postsOffset + dir * LIMIT;
    setPostsOffset(next);
    void fetchPosts(next, postsQ, postsBoardId, postsStatus);
  };

  const goCommentsPage = (dir: -1 | 1) => {
    const next = commentsOffset + dir * LIMIT;
    setCommentsOffset(next);
    void fetchComments(next, commentsQ, commentsStatus);
  };

  // ── Status toggle (single) ────────────────────────────────────────────────
  const togglePostStatus = async (post: AdminPostRow) => {
    const next: 'published' | 'hidden' = post.status === 'published' ? 'hidden' : 'published';
    setBusy(post.id, true);
    setMessage('');
    setError('');
    const res = await fetch('/api/admin/board-posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, status: next }),
    });
    setBusy(post.id, false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? '상태를 변경하지 못했습니다.');
      return;
    }
    setMessage(next === 'hidden' ? '게시글을 숨겼습니다.' : '게시글을 공개했습니다.');
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: next } : p)));
  };

  const toggleCommentStatus = async (comment: AdminCommentRow) => {
    const next: 'published' | 'hidden' = comment.status === 'published' ? 'hidden' : 'published';
    setBusy(comment.id, true);
    setMessage('');
    setError('');
    const res = await fetch('/api/admin/board-comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: comment.id, status: next }),
    });
    setBusy(comment.id, false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? '상태를 변경하지 못했습니다.');
      return;
    }
    setMessage(next === 'hidden' ? '댓글을 숨겼습니다.' : '댓글을 공개했습니다.');
    setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, status: next } : c)));
  };

  // ── Bulk status ───────────────────────────────────────────────────────────
  const bulkUpdatePosts = async (status: 'published' | 'hidden') => {
    if (selectedPostIds.size === 0) return;
    setMessage('');
    setError('');
    const ids = Array.from(selectedPostIds);
    const res = await fetch('/api/admin/board-posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? '일괄 처리에 실패했습니다.');
      return;
    }
    setMessage(`${ids.length}개 게시글을 ${status === 'hidden' ? '숨겼습니다' : '공개했습니다'}.`);
    setPosts((prev) => prev.map((p) => (selectedPostIds.has(p.id) ? { ...p, status } : p)));
    setSelectedPostIds(new Set());
  };

  const bulkUpdateComments = async (status: 'published' | 'hidden') => {
    if (selectedCommentIds.size === 0) return;
    setMessage('');
    setError('');
    const ids = Array.from(selectedCommentIds);
    const res = await fetch('/api/admin/board-comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? '일괄 처리에 실패했습니다.');
      return;
    }
    setMessage(`${ids.length}개 댓글을 ${status === 'hidden' ? '숨겼습니다' : '공개했습니다'}.`);
    setComments((prev) => prev.map((c) => (selectedCommentIds.has(c.id) ? { ...c, status } : c)));
    setSelectedCommentIds(new Set());
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deletePost = async (post: AdminPostRow) => {
    if (!window.confirm('정말 영구 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    setBusy(post.id, true);
    setMessage('');
    setError('');
    const res = await fetch(`/api/admin/board-posts?id=${post.id}`, { method: 'DELETE' });
    setBusy(post.id, false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? '삭제하지 못했습니다.');
      return;
    }
    setMessage('게시글을 영구 삭제했습니다.');
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setPostsTotal((t) => t - 1);
  };

  const deleteComment = async (comment: AdminCommentRow) => {
    if (!window.confirm('정말 영구 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    setBusy(comment.id, true);
    setMessage('');
    setError('');
    const res = await fetch(`/api/admin/board-comments?id=${comment.id}`, { method: 'DELETE' });
    setBusy(comment.id, false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? '삭제하지 못했습니다.');
      return;
    }
    setMessage('댓글을 영구 삭제했습니다.');
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    setCommentsTotal((t) => t - 1);
  };

  // ── Selection helpers ─────────────────────────────────────────────────────
  const togglePostSelect = (id: string) =>
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleCommentSelect = (id: string) =>
    setSelectedCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleExpandPost = (id: string) =>
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleExpandComment = (id: string) =>
    setExpandedCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allPostsSelected = posts.length > 0 && posts.every((p) => selectedPostIds.has(p.id));
  const allCommentsSelected =
    comments.length > 0 && comments.every((c) => selectedCommentIds.has(c.id));

  const toggleSelectAllPosts = () => {
    if (allPostsSelected) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(posts.map((p) => p.id)));
    }
  };

  const toggleSelectAllComments = () => {
    if (allCommentsSelected) {
      setSelectedCommentIds(new Set());
    } else {
      setSelectedCommentIds(new Set(comments.map((c) => c.id)));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="게시글 관리" member={member}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">게시글 · 댓글 관리</h1>
      </div>

      {message && (
        <p className="mb-4 rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>
      )}
      {error && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {/* Tab bar */}
      <div className="mb-4 flex gap-0 border-b border-deep-ocean/10">
        {(['posts', 'comments'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none ${
              activeTab === tab
                ? 'border-b-2 border-jeju-ocean text-jeju-ocean'
                : 'text-coastal-gray hover:text-deep-ocean'
            }`}
          >
            {tab === 'posts' ? '게시글' : '댓글'}
          </button>
        ))}
      </div>

      {/* ── POSTS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'posts' && (
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
              onChange={(e) => handlePostsQChange(e.target.value)}
            />
            <select
              className={selectCls}
              value={postsBoardId}
              onChange={(e) => handlePostsBoardChange(e.target.value)}
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
              onChange={(e) => handlePostsStatusChange(e.target.value)}
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
                  onChange={toggleSelectAllPosts}
                  className="accent-jeju-ocean"
                />
                전체 선택
              </label>
              {selectedPostIds.size > 0 && (
                <>
                  <span className="text-sm text-coastal-gray">{selectedPostIds.size}개 선택됨</span>
                  <button
                    type="button"
                    className={btnBulk}
                    onClick={() => void bulkUpdatePosts('hidden')}
                  >
                    일괄 숨김
                  </button>
                  <button
                    type="button"
                    className={btnBulk}
                    onClick={() => void bulkUpdatePosts('published')}
                  >
                    일괄 공개
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
                {posts.map((post) => {
                  const busy = busyIds.has(post.id);
                  const expanded = expandedPostIds.has(post.id);
                  const sortedImages = post.post_images
                    .slice()
                    .sort((a, b) => a.sort_order - b.sort_order);

                  return (
                    <li key={post.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start gap-3">
                        {/* Checkbox */}
                        {canEdit && (
                          <input
                            type="checkbox"
                            checked={selectedPostIds.has(post.id)}
                            onChange={() => togglePostSelect(post.id)}
                            className="mt-1 accent-jeju-ocean"
                          />
                        )}

                        {/* Expand toggle */}
                        <button
                          type="button"
                          onClick={() => toggleExpandPost(post.id)}
                          className="mt-0.5 text-xs text-coastal-gray hover:text-deep-ocean focus-visible:outline-none"
                          aria-label="내용 펼치기"
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
                              onClick={() => void togglePostStatus(post)}
                              className={post.status === 'published' ? btnHide : btnShow}
                            >
                              {busy ? '…' : post.status === 'published' ? '숨김' : '공개'}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void deletePost(post)}
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
                                  key={i}
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
                })}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between text-sm text-coastal-gray">
            <span>
              {postsOffset + 1}–{Math.min(postsOffset + LIMIT, postsTotal)} / 총 {postsTotal}건
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={postsOffset === 0 || postsLoading}
                onClick={() => goPostsPage(-1)}
                className={btnBulk}
              >
                이전
              </button>
              <button
                type="button"
                disabled={postsOffset + LIMIT >= postsTotal || postsLoading}
                onClick={() => goPostsPage(1)}
                className={btnBulk}
              >
                다음
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── COMMENTS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'comments' && (
        <>
          {/* Filter bar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              className={inputCls}
              placeholder="댓글 내용 검색"
              value={commentsQ}
              onChange={(e) => handleCommentsQChange(e.target.value)}
            />
            <select
              className={selectCls}
              value={commentsStatus}
              onChange={(e) => handleCommentsStatusChange(e.target.value)}
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
                  onChange={toggleSelectAllComments}
                  className="accent-jeju-ocean"
                />
                전체 선택
              </label>
              {selectedCommentIds.size > 0 && (
                <>
                  <span className="text-sm text-coastal-gray">
                    {selectedCommentIds.size}개 선택됨
                  </span>
                  <button
                    type="button"
                    className={btnBulk}
                    onClick={() => void bulkUpdateComments('hidden')}
                  >
                    일괄 숨김
                  </button>
                  <button
                    type="button"
                    className={btnBulk}
                    onClick={() => void bulkUpdateComments('published')}
                  >
                    일괄 공개
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
                {comments.map((comment) => {
                  const busy = busyIds.has(comment.id);
                  const expanded = expandedCommentIds.has(comment.id);

                  return (
                    <li key={comment.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start gap-3">
                        {/* Checkbox */}
                        {canEdit && (
                          <input
                            type="checkbox"
                            checked={selectedCommentIds.has(comment.id)}
                            onChange={() => toggleCommentSelect(comment.id)}
                            className="mt-1 accent-jeju-ocean"
                          />
                        )}

                        {/* Expand toggle */}
                        <button
                          type="button"
                          onClick={() => toggleExpandComment(comment.id)}
                          className="mt-0.5 text-xs text-coastal-gray hover:text-deep-ocean focus-visible:outline-none"
                          aria-label="내용 펼치기"
                        >
                          {expanded ? '▲' : '▼'}
                        </button>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-deep-ocean">
                            {comment.body.length > 80
                              ? comment.body.slice(0, 80) + '…'
                              : comment.body}
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
                              onClick={() => void toggleCommentStatus(comment)}
                              className={comment.status === 'published' ? btnHide : btnShow}
                            >
                              {busy ? '…' : comment.status === 'published' ? '숨김' : '공개'}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void deleteComment(comment)}
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
                })}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between text-sm text-coastal-gray">
            <span>
              {commentsOffset + 1}–{Math.min(commentsOffset + LIMIT, commentsTotal)} / 총{' '}
              {commentsTotal}건
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={commentsOffset === 0 || commentsLoading}
                onClick={() => goCommentsPage(-1)}
                className={btnBulk}
              >
                이전
              </button>
              <button
                type="button"
                disabled={commentsOffset + LIMIT >= commentsTotal || commentsLoading}
                onClick={() => goCommentsPage(1)}
                className={btnBulk}
              >
                다음
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

// ── getServerSideProps ─────────────────────────────────────────────────────

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  // Viewers can access in read-only mode; no redirect for viewer role
  const supabase = createSupabaseServerClient(context.req, context.res);

  const boardsResult = await supabase
    .from('boards')
    .select('id, slug, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const boards: BoardInfo[] = (boardsResult.data ?? []) as BoardInfo[];

  // Aggregate post counts by board + status in one query
  const countsResult = await supabase.from('posts').select('board_id, status');

  const boardCounts: BoardCounts = {};
  for (const row of (countsResult.data ?? []) as { board_id: string; status: string }[]) {
    if (!boardCounts[row.board_id]) boardCounts[row.board_id] = { published: 0, hidden: 0 };
    const cnt = boardCounts[row.board_id]!;
    if (row.status === 'published') cnt.published += 1;
    else if (row.status === 'hidden') cnt.hidden += 1;
  }

  return {
    props: {
      boards,
      boardCounts,
      member: session.member,
    } satisfies PageProps,
  };
};
