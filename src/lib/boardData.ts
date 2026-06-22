import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './supabaseConfig';
import type { Board, PostImage, PostWithMeta } from '@/types/board';

// Extract the storage object path from a board-images public URL.
export const boardImagePath = (url: string): string | null => {
  const marker = '/board-images/';
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
};

let publicClient: SupabaseClient | null | undefined;

const getPublicClient = (): SupabaseClient | null => {
  if (publicClient !== undefined) return publicClient;

  const config = getSupabasePublicConfig();
  publicClient = config
    ? createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
  return publicClient;
};

export const loadActiveBoards = async (): Promise<Board[]> => {
  const client = getPublicClient();
  if (!client) return [];
  const { data } = await client
    .from('boards')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data as Board[]) ?? [];
};

export const loadBoardBySlug = async (slug: string): Promise<Board | null> => {
  const client = getPublicClient();
  if (!client) return null;
  const { data } = await client
    .from('boards')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return (data as Board) ?? null;
};

export type BoardSort = 'latest' | 'popular';

const POST_LIST_SELECT = '*, profiles!posts_author_id_fkey(nickname), post_images(*)';

// PostgREST의 or()/ilike() 필터 구문을 깨뜨리는 문자를 공백으로 치환하고 길이를 제한한다.
const sanitizeKeyword = (kw: string): string =>
  kw
    .replace(/[%,()*\\]/g, ' ')
    .trim()
    .slice(0, 100);

export const loadBoardPosts = async (
  boardId: string,
  {
    limit = 20,
    offset = 0,
    keyword = '',
    sort = 'latest',
  }: { limit?: number; offset?: number; keyword?: string; sort?: BoardSort } = {}
): Promise<{ items: PostWithMeta[]; hasMore: boolean }> => {
  const client = getPublicClient();
  if (!client) return { items: [], hasMore: false };
  // Fetch one extra row to determine if more pages exist (avoids count:'exact').
  let query = client
    .from('posts')
    .select(POST_LIST_SELECT)
    .eq('board_id', boardId)
    .eq('status', 'published');
  const kw = sanitizeKeyword(keyword);
  if (kw) query = query.or(`title.ilike.%${kw}%,body.ilike.%${kw}%`);
  query =
    sort === 'popular'
      ? query.order('like_count', { ascending: false }).order('created_at', { ascending: false })
      : query.order('created_at', { ascending: false });
  const { data } = await query.range(offset, offset + limit);
  const rows = (data as Record<string, unknown>[]) ?? [];
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map(mapPostRow);
  return { items, hasMore };
};

export const loadBoardPostCount = async (boardId: string, keyword = ''): Promise<number> => {
  const client = getPublicClient();
  if (!client) return 0;
  let query = client
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('board_id', boardId)
    .eq('status', 'published');
  const kw = sanitizeKeyword(keyword);
  if (kw) query = query.or(`title.ilike.%${kw}%,body.ilike.%${kw}%`);
  const { count } = await query;
  return count ?? 0;
};

// Single grouped query for all boards — avoids N+1 on the board index page.
export const loadBoardPostCounts = async (): Promise<Record<string, number>> => {
  const client = getPublicClient();
  if (!client) return {};
  const { data } = await client.rpc('board_published_post_counts');
  if (!data) return {};
  return (data as { board_id: string; post_count: number }[]).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.board_id] = Number(row.post_count);
      return acc;
    },
    {}
  );
};

export const loadPostDetail = async (postId: string): Promise<PostWithMeta | null> => {
  const client = getPublicClient();
  if (!client) return null;
  const { data } = await client
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(nickname), post_images(*), boards(slug)')
    .eq('id', postId)
    .eq('status', 'published')
    .maybeSingle();
  if (!data) return null;
  return mapPostRow(data as Record<string, unknown>);
};

// Load a post via a caller-provided (session-aware) client; RLS decides visibility
// (published to anyone, or hidden to its author/admin). No status filter here.
export const loadPostDetailWithClient = async (
  client: SupabaseClient,
  postId: string
): Promise<PostWithMeta | null> => {
  const { data } = await client
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(nickname), post_images(*), boards(slug)')
    .eq('id', postId)
    .maybeSingle();
  if (!data) return null;
  return mapPostRow(data as Record<string, unknown>);
};

// 댓글 한 페이지 크기. 글 상세는 최신 한 페이지를 먼저 보여주고 '이전 댓글 더 보기'로 과거를 불러온다.
export const COMMENT_PAGE = 50;
const COMMENT_SELECT = '*, profiles!post_comments_author_id_fkey(nickname)';

const mapCommentRow = (r: Record<string, unknown>) => ({
  id: String(r.id),
  post_id: String(r.post_id),
  author_id: String(r.author_id),
  body: String(r.body),
  status: r.status as 'published' | 'hidden',
  created_at: String(r.created_at),
  updated_at: String(r.updated_at),
  author_nickname: (r.profiles as { nickname?: string } | null)?.nickname ?? '',
});

export const loadPostComments = async (postId: string) => {
  const client = getPublicClient();
  if (!client) return [];
  const { data } = await client
    .from('post_comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .eq('status', 'published')
    .order('created_at', { ascending: true })
    .limit(200);
  return ((data as Record<string, unknown>[]) ?? []).map(mapCommentRow);
};

export const mapPostRow = (row: Record<string, unknown>): PostWithMeta => {
  const rawImages = Array.isArray(row.post_images) ? (row.post_images as PostImage[]) : [];
  const images = rawImages.slice().sort((a, b) => a.sort_order - b.sort_order);
  const profile = row.profiles as { nickname?: string } | null;
  const board = row.boards as { slug?: string } | null;
  return {
    id: String(row.id),
    board_id: String(row.board_id),
    author_id: String(row.author_id),
    title: String(row.title),
    body: String(row.body ?? ''),
    rating: (row.rating as number | null) ?? null,
    status: row.status as 'published' | 'hidden',
    like_count: Number(row.like_count ?? 0),
    comment_count: Number(row.comment_count ?? 0),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    author_nickname: profile?.nickname ?? '',
    images,
    ...(board?.slug ? { board_slug: board.slug } : {}),
  };
};

// Load comments via a caller-provided (session-aware) client; no hard status filter —
// RLS decides visibility. This allows authors/admins to see comments on hidden posts.
// Returns the most-recent page first (DESC) plus a hasMore flag (fetches one extra row).
// Items are newest-first; callers reverse for ascending (conversation-order) display.
export const loadPostCommentsWithClient = async (
  client: SupabaseClient,
  postId: string,
  { limit = COMMENT_PAGE, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<{ items: ReturnType<typeof mapCommentRow>[]; hasMore: boolean }> => {
  const { data } = await client
    .from('post_comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit);
  const rows = (data as Record<string, unknown>[]) ?? [];
  const hasMore = rows.length > limit;
  return { items: rows.slice(0, limit).map(mapCommentRow), hasMore };
};
