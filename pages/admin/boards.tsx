import { useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import classNames from 'classnames';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AdminMember } from '@/types/cms';
import type { Board } from '@/types/board';

interface AdminBoardsPageProps {
  boards: Board[];
  member: AdminMember;
  initialError?: string;
}

const inputClass =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';

const btnPrimary =
  'rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean';

const btnDanger =
  'rounded border border-sunset-coral/50 bg-white px-3 py-2 text-sm font-semibold text-sunset-coral transition hover:bg-sunset-coral/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-coral';

export default function AdminBoardsPage({
  boards: initialBoards,
  member,
  initialError = '',
}: AdminBoardsPageProps) {
  const [boards, setBoards] = useState(initialBoards);

  // New board form
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSortOrder, setNewSortOrder] = useState(0);
  const [newHasRating, setNewHasRating] = useState(false);
  const [newIsActive, setNewIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-row edit state: id → partial Board fields
  const [edits, setEdits] = useState<Record<string, Partial<Board>>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);

  const refresh = async () => {
    const response = await fetch('/api/admin/boards');
    if (!response.ok) return;
    const payload = (await response.json()) as { boards: Board[] };
    setBoards(payload.boards);
  };

  const addBoard = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: newSlug,
        name: newName,
        description: newDescription,
        sort_order: newSortOrder,
        has_rating: newHasRating,
        is_active: newIsActive,
      }),
    });
    const payload = (await response.json()) as { board?: Board; error?: string };

    setIsSubmitting(false);
    if (!response.ok || !payload.board) {
      setError(payload.error || '게시판을 추가하지 못했습니다.');
      return;
    }

    setNewSlug('');
    setNewName('');
    setNewDescription('');
    setNewSortOrder(0);
    setNewHasRating(false);
    setNewIsActive(true);
    setMessage('게시판을 추가했습니다.');
    await refresh();
  };

  const patchBoard = async (
    id: string,
    body: Partial<Omit<Board, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setBusyId(id);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/boards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    const payload = (await response.json()) as { board?: Board; error?: string };

    setBusyId(null);
    if (!response.ok || !payload.board) {
      setError(payload.error || '게시판을 수정하지 못했습니다.');
      return;
    }

    setEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setMessage('게시판을 수정했습니다.');
    await refresh();
  };

  const deleteBoard = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" 게시판을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`))
      return;
    setBusyId(id);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/boards', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    setBusyId(null);
    if (!response.ok || !payload.ok) {
      setError(payload.error || '게시판을 삭제하지 못했습니다.');
      return;
    }

    setMessage('게시판을 삭제했습니다.');
    await refresh();
  };

  const getEdit = (board: Board): Board => ({ ...board, ...(edits[board.id] ?? {}) });

  const setEdit = (id: string, patch: Partial<Board>) => {
    setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }));
  };

  const isDirty = (board: Board) => {
    const e = edits[board.id];
    if (!e) return false;
    return (Object.keys(e) as (keyof typeof e)[]).some((k) => e[k] !== board[k]);
  };

  return (
    <AdminLayout title="게시판 관리" member={member}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">게시판 관리</h1>
        <p className="mt-2 max-w-2xl text-coastal-gray">
          커뮤니티 게시판을 추가하고 수정합니다. slug는 URL에 사용되므로 영문 소문자·숫자·하이픈만
          허용됩니다.
        </p>
      </div>

      {message && (
        <p className="mb-4 rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>
      )}
      {error && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {/* Add form */}
      <section className="mb-8 rounded border border-deep-ocean/10 bg-white">
        <div className="border-b border-deep-ocean/10 px-4 py-3">
          <h2 className="font-semibold">새 게시판 추가</h2>
        </div>
        <form onSubmit={addBoard} className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">slug *</span>
            <input
              type="text"
              required
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="free-talk"
              pattern="[a-z0-9\-]{1,40}"
              title="소문자 영문·숫자·하이픈, 1~40자"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">이름 *</span>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="자유게시판"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">설명</span>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="자유롭게 이야기하는 공간입니다."
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">정렬 순서</span>
            <input
              type="number"
              min={0}
              value={newSortOrder}
              onChange={(e) => setNewSortOrder(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newHasRating}
                onChange={(e) => setNewHasRating(e.target.checked)}
                className="h-4 w-4 rounded border-deep-ocean/30 accent-jeju-ocean"
              />
              <span className="font-semibold text-deep-ocean">별점 기능</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newIsActive}
                onChange={(e) => setNewIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-deep-ocean/30 accent-jeju-ocean"
              />
              <span className="font-semibold text-deep-ocean">활성</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={classNames(btnPrimary, 'w-full')}
            >
              {isSubmitting ? '추가 중' : '게시판 추가'}
            </button>
          </div>
        </form>
      </section>

      {/* Board list */}
      <section className="rounded border border-deep-ocean/10 bg-white">
        <div className="border-b border-deep-ocean/10 px-4 py-3">
          <h2 className="font-semibold">게시판 {boards.length}개</h2>
        </div>
        {boards.length === 0 ? (
          <p className="p-6 text-coastal-gray">등록된 게시판이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-deep-ocean/10">
            {boards.map((board) => {
              const busy = busyId === board.id;
              const row = getEdit(board);
              const dirty = isDirty(board);

              return (
                <li key={board.id} className="p-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-coastal-gray">
                        slug
                      </span>
                      <input
                        type="text"
                        value={row.slug}
                        disabled={busy}
                        onChange={(e) => setEdit(board.id, { slug: e.target.value })}
                        pattern="[a-z0-9\-]{1,40}"
                        title="소문자 영문·숫자·하이픈, 1~40자"
                        className={classNames(inputClass, busy && 'opacity-60')}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-coastal-gray">
                        이름
                      </span>
                      <input
                        type="text"
                        value={row.name}
                        disabled={busy}
                        onChange={(e) => setEdit(board.id, { name: e.target.value })}
                        className={classNames(inputClass, busy && 'opacity-60')}
                      />
                    </label>
                    <label className="block lg:col-span-2">
                      <span className="mb-1 block text-xs font-semibold text-coastal-gray">
                        설명
                      </span>
                      <input
                        type="text"
                        value={row.description}
                        disabled={busy}
                        onChange={(e) => setEdit(board.id, { description: e.target.value })}
                        className={classNames(inputClass, busy && 'opacity-60')}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-coastal-gray">
                        정렬 순서
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={row.sort_order}
                        disabled={busy}
                        onChange={(e) => setEdit(board.id, { sort_order: Number(e.target.value) })}
                        className={classNames(inputClass, busy && 'opacity-60')}
                      />
                    </label>
                    <div className="flex items-center gap-6 pt-4">
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={row.has_rating}
                          disabled={busy}
                          onChange={(e) => setEdit(board.id, { has_rating: e.target.checked })}
                          className="h-4 w-4 rounded border-deep-ocean/30 accent-jeju-ocean disabled:opacity-60"
                        />
                        <span className="font-semibold text-deep-ocean">별점</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={row.is_active}
                          disabled={busy}
                          onChange={(e) => setEdit(board.id, { is_active: e.target.checked })}
                          className="h-4 w-4 rounded border-deep-ocean/30 accent-jeju-ocean disabled:opacity-60"
                        />
                        <span className="font-semibold text-deep-ocean">활성</span>
                      </label>
                    </div>
                    <div className="flex items-end gap-2 lg:col-span-2">
                      <button
                        type="button"
                        disabled={busy || !dirty}
                        onClick={() =>
                          void patchBoard(board.id, {
                            slug: row.slug,
                            name: row.name,
                            description: row.description,
                            sort_order: row.sort_order,
                            has_rating: row.has_rating,
                            is_active: row.is_active,
                          })
                        }
                        className={classNames(btnPrimary, 'text-sm')}
                      >
                        {busy ? '저장 중' : '저장'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void deleteBoard(board.id, board.name)}
                        className={btnDanger}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-coastal-gray">
                    ID: {board.id} · 생성:{' '}
                    {new Intl.DateTimeFormat('ko-KR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(board.created_at))}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);
  if (!canEditContent(session.member)) {
    return { redirect: { destination: '/admin', permanent: false } };
  }

  const supabase = createSupabaseServerClient(context.req, context.res);
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('sort_order', { ascending: true });

  return {
    props: {
      boards: data ?? [],
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
