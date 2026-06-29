import { useCallback, useEffect, useRef, useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AdminMember } from '@/types/cms';
import type { AdminCommentRow } from '@/types/board';
import type { AdminPostRow, BoardInfo, BoardCounts } from '@/components/admin/board-posts/types';
import { LIMIT } from '@/components/admin/board-posts/types';
import PostsTab from '@/components/admin/board-posts/PostsTab';
import CommentsTab from '@/components/admin/board-posts/CommentsTab';

// ── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  boards: BoardInfo[];
  boardCounts: BoardCounts;
  member: AdminMember;
}

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
  const [bulkBusy, setBulkBusy] = useState(false);
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

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (postsQTimer.current) clearTimeout(postsQTimer.current);
      if (commentsQTimer.current) clearTimeout(commentsQTimer.current);
    };
  }, []);

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
    if (selectedPostIds.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    setMessage('');
    setError('');
    const ids = Array.from(selectedPostIds);
    try {
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
      const j = (await res.json()) as { updated?: number; missing?: string[] };
      const updated = j.updated ?? ids.length;
      const verb = status === 'hidden' ? '숨겼습니다' : '공개했습니다';
      if (j.missing && j.missing.length > 0) {
        setError(`${j.missing.length}개 게시글은 찾을 수 없어 건너뛰었습니다.`);
      }
      setMessage(`${updated}개 게시글을 ${verb}.`);
      // 서버 기준으로 현재 페이지를 다시 불러와 목록·total·선택 상태를 동기화한다.
      await fetchPosts(postsOffset, postsQ, postsBoardId, postsStatus);
    } catch {
      setError('일괄 처리에 실패했습니다.');
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkUpdateComments = async (status: 'published' | 'hidden') => {
    if (selectedCommentIds.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    setMessage('');
    setError('');
    const ids = Array.from(selectedCommentIds);
    try {
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
      const j = (await res.json()) as { updated?: number; missing?: string[] };
      const updated = j.updated ?? ids.length;
      const verb = status === 'hidden' ? '숨겼습니다' : '공개했습니다';
      if (j.missing && j.missing.length > 0) {
        setError(`${j.missing.length}개 댓글은 찾을 수 없어 건너뛰었습니다.`);
      }
      setMessage(`${updated}개 댓글을 ${verb}.`);
      await fetchComments(commentsOffset, commentsQ, commentsStatus);
    } catch {
      setError('일괄 처리에 실패했습니다.');
    } finally {
      setBulkBusy(false);
    }
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
    // 서버 기준으로 현재 페이지를 다시 불러와 total·다음 페이지 계산을 동기화한다.
    await fetchPosts(postsOffset, postsQ, postsBoardId, postsStatus);
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
    await fetchComments(commentsOffset, commentsQ, commentsStatus);
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
        <PostsTab
          boards={boards}
          boardCounts={boardCounts}
          canEdit={canEdit}
          posts={posts}
          postsTotal={postsTotal}
          postsLoading={postsLoading}
          postsOffset={postsOffset}
          postsQ={postsQ}
          postsBoardId={postsBoardId}
          postsStatus={postsStatus}
          selectedPostIds={selectedPostIds}
          expandedPostIds={expandedPostIds}
          bulkBusy={bulkBusy}
          busyIds={busyIds}
          allPostsSelected={allPostsSelected}
          onPostsQChange={handlePostsQChange}
          onPostsBoardChange={handlePostsBoardChange}
          onPostsStatusChange={handlePostsStatusChange}
          onToggleSelectAll={toggleSelectAllPosts}
          onTogglePostSelect={togglePostSelect}
          onToggleExpandPost={toggleExpandPost}
          onTogglePostStatus={(post) => void togglePostStatus(post)}
          onDeletePost={(post) => void deletePost(post)}
          onBulkUpdate={(status) => void bulkUpdatePosts(status)}
          onPageChange={goPostsPage}
        />
      )}

      {/* ── COMMENTS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'comments' && (
        <CommentsTab
          canEdit={canEdit}
          comments={comments}
          commentsTotal={commentsTotal}
          commentsLoading={commentsLoading}
          commentsOffset={commentsOffset}
          commentsQ={commentsQ}
          commentsStatus={commentsStatus}
          selectedCommentIds={selectedCommentIds}
          expandedCommentIds={expandedCommentIds}
          bulkBusy={bulkBusy}
          busyIds={busyIds}
          allCommentsSelected={allCommentsSelected}
          onCommentsQChange={handleCommentsQChange}
          onCommentsStatusChange={handleCommentsStatusChange}
          onToggleSelectAll={toggleSelectAllComments}
          onToggleCommentSelect={toggleCommentSelect}
          onToggleExpandComment={toggleExpandComment}
          onToggleCommentStatus={(comment) => void toggleCommentStatus(comment)}
          onDeleteComment={(comment) => void deleteComment(comment)}
          onBulkUpdate={(status) => void bulkUpdateComments(status)}
          onPageChange={goCommentsPage}
        />
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
