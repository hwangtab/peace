import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './supabaseConfig';
import type { Board, PostImage, PostWithMeta } from '@/types/board';

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

const mapPostRow = (row: Record<string, unknown>): PostWithMeta => {
  const images = (((row.post_images as PostImage[]) ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order));
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
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    author_nickname: profile?.nickname ?? '익명',
    images,
    ...(board?.slug ? { board_slug: board.slug } : {}),
  };
};
