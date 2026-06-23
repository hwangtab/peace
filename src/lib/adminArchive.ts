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
  CmsStatus,
} from '@/types/cms';

export type AdminCollection = 'videos' | 'gallery' | 'press';
export const ADMIN_COLLECTION_PAGE_SIZE = 200;
export const ADMIN_COLLECTION_MAX_PAGE_SIZE = 1000;

export type AdminCollectionRow = ArchiveVideoRow | ArchiveGalleryImageRow | ArchivePressItemRow;

export type AdminLocaleStatus = {
  locale: string;
  status: CmsStatus | 'missing';
  id: string | null;
  updated_at: string | null;
  published_at: string | null;
};

export type AdminFieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'csv'
  // 뮤지션 한 명을 이름으로 골라 id를 저장(예: 감독).
  | 'musician'
  // 뮤지션 여러 명을 이름으로 골라 id 목록(csv)을 저장(예: 출연진).
  | 'musician-multi'
  // 등록된 사진 작가를 이름으로 골라 slug를 저장(작가 2명 이상일 때만 드롭다운).
  | 'photographer'
  // 분·초 두 칸으로 입력받아 ISO 8601 duration(PT3M20S)으로 저장.
  | 'duration';

export interface AdminField {
  name: string;
  label: string;
  kind: AdminFieldKind;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  // 폼에서 렌더하지 않는 필드(예: 자동 채번되는 public_id). 값은 그대로 전송된다.
  hidden?: boolean;
  // 입력칸 아래에 보여줄 도움말 문구.
  hint?: string;
}

// 목록을 한 번에 거르는 서버측 카테고리 필터. value는 fields에 위치 순서로 매핑된다
// (예: fields=['event_type','event_year'], value='camp:2026' → event_type=camp, event_year=2026).
export interface AdminFacet {
  param: string;
  label: string;
  fields: string[];
  default?: string;
  options: { label: string; value: string }[];
}

export interface AdminCollectionConfig {
  collection: AdminCollection;
  table: 'archive_videos' | 'archive_gallery_images' | 'archive_press_items';
  title: string;
  description: string;
  listPath: string;
  emptyLabel: string;
  primaryField: string;
  fields: AdminField[];
  // 목록·편집기에서 썸네일로 보여줄 이미지 URL 필드(있으면).
  imageField?: string;
  // 연도/카테고리 등 서버측 1단계 필터(있으면).
  facet?: AdminFacet;
}

// facet value('camp:2026')를 { event_type:'camp', event_year:'2026' } 형태의 eq 필터로 변환.
export const parseAdminFacetValue = (
  facet: AdminFacet,
  value: string | undefined
): Record<string, string> | null => {
  if (!value) return null;
  const valid = facet.options.some((option) => option.value === value && option.value !== '');
  if (!valid) return null;
  const parts = value.split(':');
  const filters: Record<string, string> = {};
  facet.fields.forEach((field, index) => {
    const part = parts[index];
    if (part) filters[field] = part;
  });
  return Object.keys(filters).length > 0 ? filters : null;
};

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
  videos: {
    collection: 'videos',
    table: 'archive_videos',
    title: '비디오 아카이브',
    description: '공개 영상의 제목, 유튜브 링크, 썸네일, 노출 상태를 관리합니다.',
    listPath: '/admin/videos',
    emptyLabel: '아직 등록된 영상이 없습니다.',
    primaryField: 'title',
    fields: [
      { name: 'public_id', label: '공개 ID', kind: 'number', hidden: true },
      localeField,
      { name: 'title', label: '제목', kind: 'text', required: true },
      { name: 'description', label: '설명', kind: 'textarea' },
      { name: 'youtube_url', label: '유튜브 URL', kind: 'text', required: true },
      { name: 'date', label: '날짜', kind: 'date', required: true },
      { name: 'location', label: '장소', kind: 'text' },
      eventTypeField,
      { name: 'event_year', label: '연도', kind: 'number', required: true },
      { name: 'thumbnail_url', label: '썸네일 URL', kind: 'text' },
      { name: 'duration', label: '길이', kind: 'duration' },
      { name: 'musician_ids', label: '출연 뮤지션', kind: 'musician-multi' },
      { name: 'director_musician_id', label: '감독 뮤지션', kind: 'musician' },
      statusField,
      {
        name: 'sort_order',
        label: '정렬 순서',
        kind: 'number',
        hint: '작은 숫자가 먼저 표시됩니다. 비우면 0으로 저장됩니다.',
      },
    ],
  },
  gallery: {
    collection: 'gallery',
    table: 'archive_gallery_images',
    title: '갤러리 아카이브',
    description: '사진을 썸네일로 보고 카테고리(연도)별로 골라 설명·촬영자·공개 여부를 관리합니다.',
    listPath: '/admin/gallery',
    emptyLabel: '아직 등록된 사진이 없습니다.',
    primaryField: 'image_url',
    imageField: 'image_url',
    // 카테고리(연도) 필터. 새 캠프/앨범이 생기면 옵션을 추가한다.
    facet: {
      param: 'cat',
      label: '카테고리',
      fields: ['event_type', 'event_year'],
      default: 'camp:2026',
      options: [
        { label: '전체', value: '' },
        { label: '캠프 2026', value: 'camp:2026' },
        { label: '캠프 2025', value: 'camp:2025' },
        { label: '캠프 2023', value: 'camp:2023' },
        { label: '앨범 2024', value: 'album:2024' },
      ],
    },
    fields: [
      { name: 'public_id', label: '공개 ID', kind: 'number', hidden: true },
      localeField,
      { name: 'image_url', label: '이미지 URL', kind: 'text', required: true },
      { name: 'description', label: '설명', kind: 'textarea' },
      eventTypeField,
      { name: 'event_year', label: '연도', kind: 'number', required: true },
      {
        name: 'photographer',
        label: '촬영자',
        kind: 'photographer',
        placeholder: 'kdh',
        hint: '등록된 작가에서 고릅니다. 작가가 한 명이면 식별자(slug)를 직접 입력합니다. 비워도 됩니다.',
      },
      statusField,
      {
        name: 'sort_order',
        label: '정렬 순서',
        kind: 'number',
        hint: '작은 숫자가 먼저 표시됩니다. 비우면 0으로 저장됩니다.',
      },
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
      { name: 'public_id', label: '공개 ID', kind: 'number', hidden: true },
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
      {
        name: 'sort_order',
        label: '정렬 순서',
        kind: 'number',
        hint: '작은 숫자가 먼저 표시됩니다. 비우면 0으로 저장됩니다.',
      },
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
// 신규 항목은 public_id를 비워두면 서버가 자동 채번한다. 언어 복제·기존 항목 수정은
// 클라이언트가 기존 public_id를 그대로 보내므로 값이 유지된다.
const publicIdSchema = z.preprocess(numberValue, z.number().int().positive().nullable());
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

  const publicId = Number(row.public_id);
  if (!Number.isInteger(publicId) || publicId <= 0) return null;

  if (config.collection === 'videos') return `${localizedPath(locale, '/videos')}/${publicId}`;
  if (config.collection === 'gallery') return localizedPath(locale, '/gallery');
  if (config.collection === 'press') return localizedPath(locale, '/press');

  return null;
};

export const coerceText = textValue;
export const coerceNullableText = nullableTextValue;

// ISO 8601 duration(PT3M20S)을 분·초로 분해한다. 형식이 아니면 빈 값을 돌려준다.
export const parseIsoDuration = (value: unknown): { minutes: string; seconds: string } => {
  const match = /^PT(?:(\d+)M)?(?:(\d+)S)?$/.exec(textValue(value));
  if (!match || (!match[1] && !match[2])) return { minutes: '', seconds: '' };
  return { minutes: match[1] ?? '', seconds: match[2] ?? '' };
};

// 분·초 입력을 ISO 8601 duration으로 합친다. 둘 다 비었으면 빈 문자열(저장 시 null).
export const composeIsoDuration = (minutes: unknown, seconds: unknown): string => {
  const min = numberValue(minutes) ?? 0;
  const sec = numberValue(seconds) ?? 0;
  const safeMin = Number.isInteger(min) && min > 0 ? min : 0;
  const safeSec = Number.isInteger(sec) && sec > 0 ? sec : 0;
  if (safeMin === 0 && safeSec === 0) return '';
  return `PT${safeMin > 0 ? `${safeMin}M` : ''}${safeSec > 0 ? `${safeSec}S` : ''}`;
};
