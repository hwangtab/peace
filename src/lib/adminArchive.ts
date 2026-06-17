import { z } from 'zod';
import { LOCALES } from '@/constants/locales';
import type { EventType } from '@/types/event';
import type { GalleryImage } from '@/types/gallery';
import type { PressItem } from '@/types/press';
import type { VideoItem } from '@/types/video';
import type {
  ArchiveGalleryImageRow,
  ArchivePressItemRow,
  ArchiveVideoRow,
  CmsContentBlock,
  CmsStatus,
} from '@/types/cms';

export type AdminCollection = 'content' | 'videos' | 'gallery' | 'press';
export const ADMIN_COLLECTION_PAGE_SIZE = 200;
export const ADMIN_COLLECTION_MAX_PAGE_SIZE = 1000;

export type AdminCollectionRow =
  | CmsContentBlock
  | ArchiveVideoRow
  | ArchiveGalleryImageRow
  | ArchivePressItemRow;

export type AdminLocaleStatus = {
  locale: string;
  status: CmsStatus | 'missing';
  id: string | null;
  updated_at: string | null;
  published_at: string | null;
};

export type AdminFieldKind = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'csv';

export interface AdminField {
  name: string;
  label: string;
  kind: AdminFieldKind;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface AdminCollectionConfig {
  collection: AdminCollection;
  table: 'cms_content_blocks' | 'archive_videos' | 'archive_gallery_images' | 'archive_press_items';
  title: string;
  description: string;
  listPath: string;
  emptyLabel: string;
  primaryField: string;
  fields: AdminField[];
}

export const LOCALE_OPTIONS = LOCALES.map((locale) => ({ label: locale, value: locale }));

export const CMS_STATUS_OPTIONS: { label: string; value: CmsStatus }[] = [
  { label: '공개', value: 'published' },
  { label: '초안', value: 'draft' },
  { label: '내림', value: 'hidden' },
];

export const EVENT_TYPE_OPTIONS: { label: string; value: EventType }[] = [
  { label: '캠프', value: 'camp' },
  { label: '앨범', value: 'album' },
  { label: '라이브', value: 'live' },
  { label: '뮤직비디오', value: 'music_video' },
  { label: '인터뷰', value: 'interview' },
];

const statusField: AdminField = {
  name: 'status',
  label: '상태',
  kind: 'select',
  required: true,
  options: CMS_STATUS_OPTIONS,
};

const eventTypeField: AdminField = {
  name: 'event_type',
  label: '아카이브 유형',
  kind: 'select',
  required: true,
  options: EVENT_TYPE_OPTIONS,
};

const localeField: AdminField = {
  name: 'locale',
  label: '언어',
  kind: 'select',
  required: true,
  options: LOCALE_OPTIONS,
};

export const ADMIN_COLLECTION_CONFIGS: Record<AdminCollection, AdminCollectionConfig> = {
  content: {
    collection: 'content',
    table: 'cms_content_blocks',
    title: '웹사이트 문구',
    description: '페이지 제목, 소개 문단, 안내 문구를 Wix처럼 직접 고칩니다.',
    listPath: '/admin/content',
    emptyLabel: '아직 등록된 문구가 없습니다.',
    primaryField: 'label',
    fields: [
      {
        name: 'key',
        label: '문구 키',
        kind: 'text',
        required: true,
        placeholder: 'videos.hero.title',
      },
      localeField,
      {
        name: 'route_path',
        label: '페이지 경로',
        kind: 'text',
        required: true,
        placeholder: '/videos',
      },
      {
        name: 'placement',
        label: '위치',
        kind: 'text',
        required: true,
        placeholder: 'hero.title',
      },
      { name: 'label', label: '관리용 이름', kind: 'text', required: true },
      { name: 'value', label: '문구', kind: 'textarea', required: true },
      { name: 'description', label: '메모', kind: 'textarea' },
      statusField,
      { name: 'sort_order', label: '정렬', kind: 'number' },
    ],
  },
  videos: {
    collection: 'videos',
    table: 'archive_videos',
    title: '비디오 아카이브',
    description: '공개 영상의 제목, 유튜브 링크, 썸네일, 노출 상태를 관리합니다.',
    listPath: '/admin/videos',
    emptyLabel: '아직 등록된 영상이 없습니다.',
    primaryField: 'title',
    fields: [
      { name: 'public_id', label: '공개 ID', kind: 'number', required: true },
      localeField,
      { name: 'title', label: '제목', kind: 'text', required: true },
      { name: 'description', label: '설명', kind: 'textarea' },
      { name: 'youtube_url', label: '유튜브 URL', kind: 'text', required: true },
      { name: 'date', label: '날짜', kind: 'date', required: true },
      { name: 'location', label: '장소', kind: 'text' },
      eventTypeField,
      { name: 'event_year', label: '연도', kind: 'number', required: true },
      { name: 'thumbnail_url', label: '썸네일 URL', kind: 'text' },
      { name: 'duration', label: '길이', kind: 'text', placeholder: 'PT3M20S' },
      { name: 'musician_ids', label: '뮤지션 ID 목록', kind: 'csv', placeholder: '3, 11, 59' },
      { name: 'director_musician_id', label: '감독 뮤지션 ID', kind: 'number' },
      statusField,
      { name: 'sort_order', label: '정렬', kind: 'number' },
    ],
  },
  gallery: {
    collection: 'gallery',
    table: 'archive_gallery_images',
    title: '갤러리 아카이브',
    description: '사진 URL, 설명, 촬영자, 공개 여부를 관리합니다.',
    listPath: '/admin/gallery',
    emptyLabel: '아직 등록된 사진이 없습니다.',
    primaryField: 'image_url',
    fields: [
      { name: 'public_id', label: '공개 ID', kind: 'number', required: true },
      localeField,
      { name: 'image_url', label: '이미지 URL', kind: 'text', required: true },
      { name: 'description', label: '설명', kind: 'textarea' },
      eventTypeField,
      { name: 'event_year', label: '연도', kind: 'number', required: true },
      { name: 'photographer', label: '촬영자 slug', kind: 'text', placeholder: 'kdh' },
      statusField,
      { name: 'sort_order', label: '정렬', kind: 'number' },
    ],
  },
  press: {
    collection: 'press',
    table: 'archive_press_items',
    title: '언론보도 아카이브',
    description: '기사 링크, 매체, 요약, 대표 이미지를 관리합니다.',
    listPath: '/admin/press',
    emptyLabel: '아직 등록된 언론보도가 없습니다.',
    primaryField: 'title',
    fields: [
      { name: 'public_id', label: '공개 ID', kind: 'number', required: true },
      localeField,
      { name: 'title', label: '제목', kind: 'text', required: true },
      { name: 'publisher', label: '매체', kind: 'text', required: true },
      { name: 'date', label: '날짜', kind: 'date', required: true },
      { name: 'source_url', label: '기사 URL', kind: 'text', required: true },
      { name: 'description', label: '요약', kind: 'textarea' },
      { name: 'image_url', label: '대표 이미지 URL', kind: 'text' },
      eventTypeField,
      { name: 'event_year', label: '연도', kind: 'number', required: true },
      statusField,
      { name: 'sort_order', label: '정렬', kind: 'number' },
    ],
  },
};

const emptyToNull = (value: unknown) => (value === '' || value === undefined ? null : value);
const textValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const nullableTextValue = (value: unknown) => {
  const text = textValue(value);
  return text ? text : null;
};
const numberValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};
const csvNumberArray = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => numberValue(item))
      .filter((item): item is number => typeof item === 'number');
  }
  return String(value ?? '')
    .split(',')
    .map((item) => numberValue(item.trim()))
    .filter((item): item is number => typeof item === 'number');
};

const cmsStatusSchema = z.enum(['draft', 'published', 'hidden']);
const eventTypeSchema = z.enum(['camp', 'album', 'live', 'music_video', 'interview']);
const localeSchema = z.enum(LOCALES);
const publicIdSchema = z.preprocess(numberValue, z.number().int().positive());
const optionalIntegerSchema = z.preprocess(numberValue, z.number().int().nullable());
const sortOrderSchema = z.preprocess((value) => numberValue(value) ?? 0, z.number().int());
const nullableTextSchema = z.preprocess(emptyToNull, z.string().trim().nullable());
const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다.');
const externalUrlSchema = z.string().trim().url('올바른 URL이어야 합니다.');
const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};
const isPathOrHttpUrl = (value: string) => value.startsWith('/') || isHttpUrl(value);
const imageUrlSchema = z
  .string()
  .trim()
  .refine(isPathOrHttpUrl, '이미지 URL은 / 경로 또는 http(s) URL이어야 합니다.');
const nullableImageUrlSchema = z.preprocess(emptyToNull, imageUrlSchema.nullable());

const contentSchema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().trim().min(1),
  locale: localeSchema.default('ko'),
  route_path: z
    .string()
    .trim()
    .regex(/^\/[a-z0-9/_-]*$/i, '페이지 경로는 /로 시작해야 합니다.'),
  placement: z.string().trim().min(1),
  label: z.string().trim().min(1),
  value: z.string().default(''),
  description: nullableTextSchema.optional(),
  status: cmsStatusSchema.default('draft'),
  sort_order: sortOrderSchema,
});

const videoSchema = z.object({
  id: z.string().uuid().optional(),
  public_id: publicIdSchema,
  locale: localeSchema.default('ko'),
  title: z.string().trim().min(1),
  description: z.string().default(''),
  youtube_url: externalUrlSchema,
  date: dateSchema,
  location: z.string().default(''),
  event_type: eventTypeSchema.default('camp'),
  event_year: z.preprocess(numberValue, z.number().int().min(2000)),
  thumbnail_url: nullableImageUrlSchema.optional(),
  duration: nullableTextSchema.optional(),
  musician_ids: z.preprocess(csvNumberArray, z.array(z.number().int())).default([]),
  director_musician_id: optionalIntegerSchema.optional(),
  status: cmsStatusSchema.default('draft'),
  sort_order: sortOrderSchema,
});

const gallerySchema = z.object({
  id: z.string().uuid().optional(),
  public_id: publicIdSchema,
  locale: localeSchema.default('ko'),
  image_url: imageUrlSchema,
  description: nullableTextSchema.optional(),
  event_type: eventTypeSchema.default('camp'),
  event_year: z.preprocess(numberValue, z.number().int().min(2000)),
  photographer: nullableTextSchema.optional(),
  status: cmsStatusSchema.default('draft'),
  sort_order: sortOrderSchema,
});

const pressSchema = z.object({
  id: z.string().uuid().optional(),
  public_id: publicIdSchema,
  locale: localeSchema.default('ko'),
  title: z.string().trim().min(1),
  publisher: z.string().trim().min(1),
  date: dateSchema,
  source_url: externalUrlSchema,
  description: z.string().default(''),
  image_url: nullableImageUrlSchema.optional(),
  event_type: eventTypeSchema.default('camp'),
  event_year: z.preprocess(numberValue, z.number().int().min(2000)),
  status: cmsStatusSchema.default('draft'),
  sort_order: sortOrderSchema,
});

export const sanitizeAdminPayload = (
  collection: AdminCollection,
  input: unknown
): Record<string, unknown> => {
  switch (collection) {
    case 'content':
      return contentSchema.parse(input);
    case 'videos':
      return videoSchema.parse(input);
    case 'gallery':
      return gallerySchema.parse(input);
    case 'press':
      return pressSchema.parse(input);
  }
};

export const getAdminCollectionConfig = (collection: string): AdminCollectionConfig | null =>
  collection in ADMIN_COLLECTION_CONFIGS
    ? ADMIN_COLLECTION_CONFIGS[collection as AdminCollection]
    : null;

export const getAdminPaginationRange = ({ offset, limit }: { offset?: number; limit?: number }) => {
  const safeOffset =
    Number.isFinite(offset) && offset != null ? Math.max(0, Math.floor(offset)) : 0;
  const parsedLimit = Number.isFinite(limit) && limit != null ? Math.floor(limit) : null;
  const rawLimit =
    parsedLimit != null && parsedLimit > 0 ? parsedLimit : ADMIN_COLLECTION_PAGE_SIZE;
  const safeLimit = Math.min(rawLimit, ADMIN_COLLECTION_MAX_PAGE_SIZE);

  return {
    from: safeOffset,
    to: safeOffset + safeLimit - 1,
    limit: safeLimit,
  };
};

export const buildAdminLocaleStatuses = (
  rows: Array<{
    id?: string | null;
    locale?: string | null;
    status?: CmsStatus | null;
    updated_at?: string | null;
    published_at?: string | null;
  }>
): AdminLocaleStatus[] => {
  const byLocale = new Map(rows.map((row) => [row.locale, row]));

  return LOCALES.map((locale) => {
    const row = byLocale.get(locale);
    return {
      locale,
      status: row?.status ?? 'missing',
      id: row?.id ?? null,
      updated_at: row?.updated_at ?? null,
      published_at: row?.published_at ?? null,
    };
  });
};

export const normalizeAdminFormValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined) return '';
  return String(value);
};

export const makePublishedAt = (status: CmsStatus, previous?: string | null): string | null =>
  status === 'published' ? (previous ?? new Date().toISOString()) : null;

export const mapVideoRowToItem = (row: ArchiveVideoRow): VideoItem => ({
  id: row.public_id,
  title: row.title,
  description: row.description,
  youtubeUrl: row.youtube_url,
  date: row.date,
  location: row.location,
  eventType: row.event_type,
  eventYear: row.event_year,
  ...(row.thumbnail_url ? { thumbnailUrl: row.thumbnail_url } : {}),
  ...(row.duration ? { duration: row.duration } : {}),
  ...(row.musician_ids.length ? { musicianIds: row.musician_ids } : {}),
  ...(row.director_musician_id ? { directorMusicianId: row.director_musician_id } : {}),
});

export const mapGalleryRowToItem = (row: ArchiveGalleryImageRow): GalleryImage => ({
  id: row.public_id,
  url: row.image_url,
  eventType: row.event_type,
  eventYear: row.event_year,
  ...(row.description ? { description: row.description } : {}),
  ...(row.photographer ? { photographer: row.photographer } : {}),
});

export const mapPressRowToItem = (row: ArchivePressItemRow): PressItem => ({
  id: row.public_id,
  title: row.title,
  publisher: row.publisher,
  date: row.date,
  url: row.source_url,
  description: row.description,
  eventType: row.event_type,
  eventYear: row.event_year,
  ...(row.image_url ? { imageUrl: row.image_url } : {}),
});

export const toContentMap = (rows: CmsContentBlock[]): Record<string, string> =>
  rows.reduce<Record<string, string>>((map, row) => {
    map[row.placement] = row.value;
    return map;
  }, {});

export const getPrimaryLabel = (row: AdminCollectionRow, config: AdminCollectionConfig): string => {
  const value = (row as unknown as Record<string, unknown>)[config.primaryField];
  return typeof value === 'string' && value ? value : `#${String(row.id).slice(0, 8)}`;
};

export const getRowStatus = (row: AdminCollectionRow): CmsStatus =>
  (row as unknown as { status?: CmsStatus }).status ?? 'draft';

export const getRowUpdatedAt = (row: AdminCollectionRow): string =>
  (row as unknown as { updated_at?: string }).updated_at ?? '';

export type AdminStatusFilter = CmsStatus | 'all';

export const filterAdminRows = (
  rows: AdminCollectionRow[],
  config: AdminCollectionConfig,
  filters: { query?: string; status?: AdminStatusFilter }
): AdminCollectionRow[] => {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  const status = filters.status ?? 'all';

  return rows.filter((row) => {
    if (status !== 'all' && getRowStatus(row) !== status) return false;
    if (!query) return true;

    const source = row as unknown as Record<string, unknown>;
    const searchable = [
      getPrimaryLabel(row, config),
      ...Object.values(source).filter(
        (value): value is string | number => typeof value === 'string' || typeof value === 'number'
      ),
    ]
      .join(' ')
      .toLocaleLowerCase();

    return searchable.includes(query);
  });
};

export const mergeAdminRowsById = (
  currentRows: AdminCollectionRow[],
  nextRows: AdminCollectionRow[]
): AdminCollectionRow[] => {
  const seen = new Set(currentRows.map((item) => item.id));
  return [...currentRows, ...nextRows.filter((item) => !seen.has(item.id))];
};

export const prepareAdminLocaleClonePayload = (
  config: AdminCollectionConfig,
  row: AdminCollectionRow,
  targetLocale: string
): Record<string, unknown> => {
  const source = row as unknown as Record<string, unknown>;
  return config.fields.reduce<Record<string, unknown>>((payload, field) => {
    if (field.name === 'locale') {
      payload.locale = targetLocale;
    } else if (field.name === 'status') {
      payload.status = 'draft';
    } else {
      payload[field.name] = source[field.name];
    }
    return payload;
  }, {});
};

export const prepareAdminMissingLocaleClonePayloads = (
  config: AdminCollectionConfig,
  row: AdminCollectionRow,
  localeStatuses: AdminLocaleStatus[]
): Record<string, unknown>[] =>
  localeStatuses
    .filter((item) => item.status === 'missing')
    .map((item) => prepareAdminLocaleClonePayload(config, row, item.locale));

const normalizePreviewLocale = (locale: unknown): string =>
  typeof locale === 'string' && LOCALES.includes(locale as (typeof LOCALES)[number])
    ? locale
    : 'ko';

const localizedPath = (locale: unknown, path: string): string =>
  `/${normalizePreviewLocale(locale)}${path === '/' ? '' : path}`;

export const getAdminPreviewUrl = (
  config: AdminCollectionConfig,
  row: Partial<Record<string, unknown>>
): string | null => {
  const locale = row.locale;

  if (config.collection === 'content') {
    const routePath = typeof row.route_path === 'string' ? row.route_path.trim() : '';
    if (!routePath.startsWith('/')) return null;
    return localizedPath(locale, routePath);
  }

  const publicId = Number(row.public_id);
  if (!Number.isInteger(publicId) || publicId <= 0) return null;

  if (config.collection === 'videos') return `${localizedPath(locale, '/videos')}/${publicId}`;
  if (config.collection === 'gallery') return localizedPath(locale, '/gallery');
  if (config.collection === 'press') return localizedPath(locale, '/press');

  return null;
};

export const coerceText = textValue;
export const coerceNullableText = nullableTextValue;
