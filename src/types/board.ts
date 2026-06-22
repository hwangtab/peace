export interface Board {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  has_rating: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  sort_order: number;
}

export interface Post {
  id: string;
  board_id: string;
  author_id: string;
  title: string;
  body: string;
  rating: number | null;
  status: 'published' | 'hidden';
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
  updated_at: string;
}

export interface PostWithMeta extends Post {
  author_nickname: string;
  images: PostImage[];
  board_slug?: string;
}

/** Flat shape returned by /api/admin/board-comments */
export interface AdminCommentRow {
  id: string;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
  post_id: string;
  post_title: string;
  author_nickname: string;
}
