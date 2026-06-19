import { useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AdminMember } from '@/types/cms';

interface PostRow {
  id: string;
  title: string;
  board_id: string;
  author_id: string;
  status: 'published' | 'hidden';
  created_at: string;
  boards: { slug: string } | null;
  profiles: { nickname: string } | null;
}

interface AdminBoardPostsPageProps {
  posts: PostRow[];
  member: AdminMember;
  initialError?: string;
}

const btnToggleHide =
  'rounded border border-sunset-coral/50 bg-white px-3 py-1.5 text-xs font-semibold text-sunset-coral transition hover:bg-sunset-coral/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-coral';

const btnToggleShow =
  'rounded border border-jeju-ocean/50 bg-white px-3 py-1.5 text-xs font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean';

export default function AdminBoardPostsPage({
  posts: initialPosts,
  member,
  initialError = '',
}: AdminBoardPostsPageProps) {
  const [posts, setPosts] = useState<PostRow[]>(initialPosts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);

  const refresh = async () => {
    const response = await fetch('/api/admin/board-posts');
    if (!response.ok) return;
    const payload = (await response.json()) as { posts: PostRow[] };
    setPosts(payload.posts);
  };

  const toggleStatus = async (post: PostRow) => {
    const nextStatus: 'published' | 'hidden' =
      post.status === 'published' ? 'hidden' : 'published';
    setBusyId(post.id);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/board-posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, status: nextStatus }),
    });
    const payload = (await response.json()) as {
      post?: { id: string; status: string };
      error?: string;
    };

    setBusyId(null);
    if (!response.ok || !payload.post) {
      setError(payload.error || '상태를 변경하지 못했습니다.');
      return;
    }

    setMessage(nextStatus === 'hidden' ? '게시글을 숨겼습니다.' : '게시글을 공개했습니다.');
    await refresh();
  };

  const fmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <AdminLayout title="게시글 관리" member={member}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">게시글 관리</h1>
        <p className="mt-2 max-w-2xl text-coastal-gray">
          최근 게시글 100개를 확인하고 숨김/공개 상태를 전환합니다.
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

      <section className="rounded border border-deep-ocean/10 bg-white">
        <div className="border-b border-deep-ocean/10 px-4 py-3">
          <h2 className="font-semibold">게시글 {posts.length}개</h2>
        </div>
        {posts.length === 0 ? (
          <p className="p-6 text-coastal-gray">게시글이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-deep-ocean/10">
            {posts.map((post) => {
              const busy = busyId === post.id;
              return (
                <li key={post.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{post.title}</p>
                    <p className="mt-0.5 text-xs text-coastal-gray">
                      게시판: {post.boards?.slug ?? post.board_id} &middot; 작성자:{' '}
                      {post.profiles?.nickname ?? post.author_id} &middot;{' '}
                      {fmt.format(new Date(post.created_at))}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      post.status === 'published'
                        ? 'bg-jeju-ocean/10 text-jeju-ocean'
                        : 'bg-sunset-coral/10 text-sunset-coral'
                    }`}
                  >
                    {post.status === 'published' ? '공개' : '숨김'}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void toggleStatus(post)}
                    className={post.status === 'published' ? btnToggleHide : btnToggleShow}
                  >
                    {busy ? '처리 중' : post.status === 'published' ? '숨김' : '공개'}
                  </button>
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
    .from('posts')
    .select(
      'id, title, board_id, author_id, status, created_at, boards(slug), profiles!posts_author_id_fkey(nickname)'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  return {
    props: {
      posts: data ?? [],
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
