import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/components/auth/AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { validateComment, formatBoardDate } from '@/lib/boardForms';
import { safeRedirectPath } from '@/lib/memberAuth';
import { COMMENT_PAGE } from '@/lib/boardData';

// 삭제 확인 다이얼로그(@headlessui/react ~15.6KB gzip)는 댓글 삭제 클릭 시점에만 필요 —
// 글 상세 페이지 초기 번들에서 분리한다. (같은 페이지의 ImageLightbox·ConfirmDialog와 동일 패턴)
const ConfirmDialog = dynamic(() => import('@/components/common/ConfirmDialog'), { ssr: false });

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
  updated_at: string;
  author_nickname: string;
}

interface Props {
  postId: string;
  initialComments: CommentRow[];
  initialHasMore?: boolean;
  readOnly?: boolean;
}

const COMMENT_SELECT = '*, profiles!post_comments_author_id_fkey(nickname)';

function mapRow(r: Record<string, unknown>): CommentRow {
  return {
    id: String(r.id),
    post_id: String(r.post_id),
    author_id: String(r.author_id),
    body: String(r.body),
    status: r.status as 'published' | 'hidden',
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    author_nickname: (r.profiles as { nickname?: string } | null)?.nickname ?? '',
  };
}

// 작성 시각과 수정 시각이 1초 이상 차이 나면 '수정됨'으로 표시한다(insert 시 둘은 동일).
function isEdited(c: CommentRow): boolean {
  return new Date(c.updated_at).getTime() - new Date(c.created_at).getTime() > 1000;
}

export default function CommentSection({
  postId,
  initialComments,
  initialHasMore = false,
  readOnly = false,
}: Props) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const auth = useAuth();
  const user = auth.user;

  // comments는 항상 오름차순(과거→최신, 대화 순서)으로 보관·표시한다.
  const [comments, setComments] = useState<CommentRow[]>(initialComments);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const [body, setBody] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // 삭제 확인 모달 대기 중인 댓글 id(window.confirm 대체)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // 저장 응답 도착 시점에도 "여전히 같은 댓글을 편집 중인가"를 대조하기 위한 ref.
  // (A 저장 중 사용자가 B 수정을 시작하면 B 세션을 통보 없이 닫지 않기 위함)
  const editIdRef = useRef<string | null>(null);
  useEffect(() => {
    editIdRef.current = editId;
  }, [editId]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loginHref = `/login?next=${encodeURIComponent(safeRedirectPath(router.asPath))}`;

  // 위쪽 '이전 댓글 더 보기' — 더 오래된 댓글 한 페이지를 불러와 앞에 붙인다.
  const loadOlder = async () => {
    if (loadingMore) return;
    const oldest = comments[0];
    if (!oldest) return;
    setLoadingMore(true);
    try {
      const supabase = createSupabaseBrowserClient();
      // 커서(현재 가장 오래된 댓글의 created_at) 기준으로 더 과거를 불러온다.
      // offset 방식과 달리 새 댓글이 추가돼도 경계가 밀리지 않아 누락/중복이 없다.
      const { data } = await supabase
        .from('post_comments')
        .select(COMMENT_SELECT)
        .eq('post_id', postId)
        .lt('created_at', oldest.created_at)
        .order('created_at', { ascending: false })
        .range(0, COMMENT_PAGE);
      const rows = (data as Record<string, unknown>[] | null) ?? [];
      const more = rows.length > COMMENT_PAGE;
      const olderAsc = rows.slice(0, COMMENT_PAGE).map(mapRow).reverse();
      setComments((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        const fresh = olderAsc.filter((c) => !seen.has(c.id));
        return [...fresh, ...prev];
      });
      setHasMore(more);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const result = validateComment(body);
    if (!result.ok) {
      setValidationError(t(result.reason));
      return;
    }

    if (!user) return;

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: insertError } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, author_id: user.id, body: result.value })
        .select(COMMENT_SELECT)
        .single();
      if (insertError || !data) {
        setValidationError(t('error.saveFailed'));
        return;
      }
      const created = mapRow(data as Record<string, unknown>);
      if (!created.author_nickname) created.author_nickname = auth.profile?.nickname ?? '';
      // 새 댓글은 가장 최신이므로 맨 아래에 추가 → 항상 바로 보인다.
      setComments((prev) => [...prev, created]);
      setBody('');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c: CommentRow) => {
    setEditId(c.id);
    setEditBody(c.body);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditBody('');
    setEditError(null);
  };

  const saveEdit = async (commentId: string) => {
    setEditError(null);
    const result = validateComment(editBody);
    if (!result.ok) {
      setEditError(t(result.reason));
      return;
    }
    setSavingEdit(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('post_comments')
        .update({ body: result.value })
        .eq('id', commentId);
      if (error) {
        setEditError(t('error.saveFailed'));
        return;
      }
      const now = new Date().toISOString();
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, body: result.value, updated_at: now } : c))
      );
      // 저장 완료 시점에도 여전히 이 댓글을 편집 중일 때만 편집 세션을 닫는다.
      if (editIdRef.current === commentId) cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeleteError(null);
    setDeleteId(commentId);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
      if (error) {
        setDeleteError(t('error.saveFailed'));
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } finally {
      setDeleteId(null);
      setPendingDeleteId(null);
    }
  };

  return (
    <section className="mt-10 border-t border-seafoam pt-8">
      <h2 className="mb-4 text-base font-semibold text-deep-ocean">{t('comment.heading')}</h2>

      {/* Load older comments */}
      {hasMore && (
        <div className="mb-4 text-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => {
              void loadOlder();
            }}
            className="rounded-lg border border-seafoam px-4 py-1.5 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam disabled:opacity-50"
          >
            {t('comment.loadOlder')}
          </button>
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <p role="alert" className="mb-3 text-xs text-red-500">
          {deleteError}
        </p>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-coastal-gray">{t('comment.empty')}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const dateStr = formatBoardDate(c.created_at);
            const isOwn = user?.id === c.author_id;
            const isDeleting = deleteId === c.id;
            const isHidden = c.status === 'hidden';
            const isEditing = editId === c.id;

            return (
              <li
                key={c.id}
                className={[
                  'rounded-xl border border-seafoam bg-white p-4',
                  isHidden ? 'opacity-50' : '',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-coastal-gray">
                    <span className="font-semibold text-deep-ocean">
                      {c.author_nickname || t('post.anonymous')}
                    </span>
                    <span>·</span>
                    <span>{dateStr}</span>
                    {isEdited(c) && <span className="text-xs">{t('comment.edited')}</span>}
                  </div>
                  {isOwn && !isEditing && (
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="text-xs text-coastal-gray hover:text-jeju-ocean"
                      >
                        {t('comment.edit')}
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setPendingDeleteId(c.id)}
                        className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                      >
                        {t('comment.delete')}
                      </button>
                    </div>
                  )}
                </div>
                {isHidden && (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    {t('comment.hiddenNotice')}
                  </p>
                )}
                {isEditing ? (
                  <div className="mt-2">
                    <label htmlFor={`comment-edit-${c.id}`} className="sr-only">
                      {t('comment.edit')}
                    </label>
                    <textarea
                      id={`comment-edit-${c.id}`}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      className="w-full rounded-xl border border-seafoam p-3 text-sm text-deep-ocean focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean"
                    />
                    {editError && <p className="mt-1 text-xs text-red-500">{editError}</p>}
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-coastal-gray px-4 py-1.5 text-sm font-semibold text-coastal-gray transition hover:bg-seafoam"
                      >
                        {t('comment.cancel')}
                      </button>
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => {
                          void saveEdit(c.id);
                        }}
                        className="rounded-lg bg-jeju-ocean px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {t('comment.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-deep-ocean">
                    {c.body}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Add comment form / login prompt — hidden when post is read-only (e.g. hidden status) */}
      {!readOnly && (
        <div className="mt-6">
          {user ? (
            <form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              noValidate
            >
              <label htmlFor="comment-body" className="sr-only">
                {t('comment.placeholder')}
              </label>
              <textarea
                id="comment-body"
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('comment.placeholder')}
                rows={3}
                maxLength={1000}
                className="w-full rounded-xl border border-seafoam p-3 text-sm text-deep-ocean placeholder-coastal-gray focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean"
              />
              {validationError && <p className="mt-1 text-xs text-red-500">{validationError}</p>}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-jeju-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {t('comment.submit')}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-coastal-gray">
              <Link href={loginHref} className="text-jeju-ocean underline hover:opacity-80">
                {t('error.loginRequired')}
              </Link>
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        show={pendingDeleteId !== null}
        message={t('comment.deleteConfirm')}
        confirmLabel={t('comment.delete')}
        cancelLabel={t('comment.cancel')}
        busy={deleteId !== null}
        onConfirm={() => {
          if (pendingDeleteId) void handleDelete(pendingDeleteId);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  );
}
