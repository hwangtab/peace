export type CmsStatus = 'draft' | 'published' | 'hidden';

export type SiteContentMap = Record<string, string>;

export interface AdminMember {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  role: 'owner' | 'editor' | 'viewer';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsContentBlock {
  id: string;
  key: string;
  locale: string;
  route_path: string;
  placement: string;
  label: string;
  value: string;
  description: string | null;
  status: CmsStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArchiveVideoRow {
  id: string;
  public_id: number;
  locale: string;
  title: string;
  description: string;
  youtube_url: string;
  date: string;
  location: string;
  event_type: 'camp' | 'album';
  event_year: number;
  thumbnail_url: string | null;
  duration: string | null;
  musician_ids: number[];
  director_musician_id: number | null;
  status: CmsStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArchiveGalleryImageRow {
  id: string;
  public_id: number;
  locale: string;
  image_url: string;
  description: string | null;
  event_type: 'camp' | 'album';
  event_year: number;
  photographer: string | null;
  status: CmsStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArchivePressItemRow {
  id: string;
  public_id: number;
  locale: string;
  title: string;
  publisher: string;
  date: string;
  source_url: string;
  description: string;
  image_url: string | null;
  event_type: 'camp' | 'album';
  event_year: number;
  status: CmsStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
