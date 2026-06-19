export type CmsStatus = 'draft' | 'published' | 'hidden';
export type ArchiveEventType = 'camp' | 'album' | 'live' | 'music_video' | 'interview';
export type CmsChangeAction = 'create' | 'update' | 'hide' | 'restore';
export type AdminRole = 'owner' | 'editor' | 'viewer';

export type SiteContentMap = Record<string, string>;

export interface AdminDocument {
  id: string;
  slug: string;
  title: string;
  body_md: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminMember {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  role: AdminRole;
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
  event_type: ArchiveEventType;
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
  event_type: ArchiveEventType;
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
  event_type: ArchiveEventType;
  event_year: number;
  status: CmsStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsChangeLog {
  id: string;
  collection: 'content' | 'videos' | 'gallery' | 'press';
  table_name:
    | 'cms_content_blocks'
    | 'archive_videos'
    | 'archive_gallery_images'
    | 'archive_press_items';
  row_id: string | null;
  public_id: number | null;
  locale: string | null;
  action: CmsChangeAction;
  primary_label: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  admin_member_id: string | null;
  admin_email: string;
  restored_from_log_id: string | null;
  created_at: string;
}
