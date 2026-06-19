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

export const loadBoardPosts = async (
  boardId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number }
): Promise<{ items: PostWithMeta[]; total: number }> => {
  const client = getPublicClient();
  if (!client) return { items: [], total: 0 };
  const { data, count } = await client
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(nickname), post_images(*)', { count: 'exact' })
    .eq('board_id', boardId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  const items = ((data as Record<string, unknown>[]) ?? []).map(mapPostRow);
  return { items, total: count ?? items.length };
};

export const loadBoardPostCount = async (boardId: string): Promise<number> => {
  const client = getPublicClient();
  if (!client) return 0;
  const { count } = await client
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('board_id', boardId)
    .eq('status', 'published');
  return count ?? 0;
};

// Single grouped query for all boards — avoids N+1 on the board index page.
export const loadBoardPostCounts = async (): Promise<Record<string, number>> => {
  const client = getPublicClient();
  if (!client) return {};
  const { data } = await client.rpc('board_published_post_counts');
  if (!data) return {};
  return (data as { board_id: string; post_count: number }[]).reduce<Record<string, number>>(
    (acc, row) => { acc[row.board_id] = Number(row.post_count); return acc; },
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
  client: SupabaseClient, postId: string
): Promise<PostWithMeta | null> => {
  const { data } = await client
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(nickname), post_images(*), boards(slug)')
    .eq('id', postId)
    .maybeSingle();
  if (!data) return null;
  return mapPostRow(data as Record<string, unknown>);
};

export const loadPostComments = async (postId: string) => {
  const client = getPublicClient();
  if (!client) return [];
  const { data } = await client.from('post_comments')
    .select('*, profiles!post_comments_author_id_fkey(nickname)')
    .eq('post_id', postId).eq('status', 'published').order('created_at', { ascending: true });
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: String(r.id), post_id: String(r.post_id), author_id: String(r.author_id),
    body: String(r.body), status: r.status as 'published'|'hidden',
    created_at: String(r.created_at), updated_at: String(r.updated_at),
    author_nickname: (r.profiles as {nickname?:string} | null)?.nickname ?? '',
  }));
};

export const mapPostRow = (row: Record<string, unknown>): PostWithMeta => {
  const rawImages = Array.isArray(row.post_images) ? (row.post_images as PostImage[]) : [];
  const images = rawImages
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
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
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    author_nickname: profile?.nickname ?? '',
    images,
    ...(board?.slug ? { board_slug: board.slug } : {}),
  };
};

// Load comments via a caller-provided (session-aware) client; no hard status filter —
// RLS decides visibility. This allows authors/admins to see comments on hidden posts.
export const loadPostCommentsWithClient = async (
  client: SupabaseClient, postId: string
) => {
  const { data } = await client.from('post_comments')
    .select('*, profiles!post_comments_author_id_fkey(nickname)')
    .eq('post_id', postId).order('created_at', { ascending: true });
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: String(r.id), post_id: String(r.post_id), author_id: String(r.author_id),
    body: String(r.body), status: r.status as 'published'|'hidden',
    created_at: String(r.created_at), updated_at: String(r.updated_at),
    author_nickname: (r.profiles as {nickname?:string} | null)?.nickname ?? '',
  }));
};
