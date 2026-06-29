import type { Board } from '@/types/board';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PostImageRow {
  image_url: string;
  sort_order: number;
}

export interface AdminPostRow {
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

export type BoardInfo = Pick<Board, 'id' | 'slug' | 'name'>;
export type BoardCounts = Record<string, { published: number; hidden: number }>;

// ── Shared style constants ────────────────────────────────────────────────────

export const btnHide =
  'rounded border border-sunset-coral/50 bg-white px-2.5 py-1 text-xs font-semibold text-sunset-coral transition hover:bg-sunset-coral/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-coral';
export const btnShow =
  'rounded border border-jeju-ocean/50 bg-white px-2.5 py-1 text-xs font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean';
export const btnDanger =
  'rounded border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400';
export const btnLink =
  'rounded border border-deep-ocean/20 bg-white px-2.5 py-1 text-xs font-semibold text-deep-ocean/70 transition hover:bg-deep-ocean/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-ocean/40';
export const inputCls =
  'rounded border border-deep-ocean/20 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jeju-ocean/40';
export const selectCls =
  'rounded border border-deep-ocean/20 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jeju-ocean/40';
export const btnBulk =
  'rounded border border-deep-ocean/20 bg-white px-3 py-1.5 text-xs font-semibold text-deep-ocean transition hover:bg-deep-ocean/5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-ocean/40';

export const LIMIT = 30;
export const fmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
