import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { GalleryImage } from '../src/types/gallery';
import type { PressItem } from '../src/types/press';
import type { VideoItem } from '../src/types/video';
import { readJsonArray, loadGalleryImages, loadLocalizedData } from '../src/utils/dataLoader';
import { LOCALES, type Locale } from '../src/constants/locales';

const loadLocalEnv = () => {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (!key || process.env[key]) continue;
    process.env[key] = valueParts.join('=').replace(/^['"]|['"]$/g, '');
  }
};

const mustGetEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required. Use SUPABASE_SERVICE_ROLE_KEY only in local/CI secrets.`);
  }
  return value;
};

const toDate = (value: string | undefined, fallback = '2024-01-01') => value || fallback;
const nowIso = () => new Date().toISOString();

const loadLocaleJson = (locale: string, namespace: string): Record<string, unknown> => {
  const filePath = path.join(process.cwd(), 'public', 'locales', locale, `${namespace}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
};

const localizedDataPath = (locale: Locale, filename: string): string =>
  locale === 'ko'
    ? path.join(process.cwd(), 'public', 'data', filename)
    : path.join(process.cwd(), 'public', 'data', locale, filename);

const loadDirectOrFallbackData = <T>(locale: Locale, filename: string): T[] => {
  const direct = localizedDataPath(locale, filename);
  return fs.existsSync(direct) ? readJsonArray<T>(direct) : loadLocalizedData<T>(locale, filename);
};

const pick = (source: Record<string, unknown>, pathKey: string): string => {
  const value = pathKey.split('.').reduce<unknown>((current, key) => {
    if (typeof current !== 'object' || current === null) return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
  return typeof value === 'string' ? value : '';
};

const makeGalleryPublicId = (item: GalleryImage): number => {
  const typeOffset = item.eventType === 'album' ? 50000 : 0;
  return item.eventYear * 100000 + typeOffset + item.id;
};

interface UpsertSource {
  from: (table: string) => unknown;
}

const upsertRows = async (
  supabase: UpsertSource,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string
) => {
  const tableClient = supabase.from(table) as unknown as {
    upsert: (
      values: Record<string, unknown>[],
      options: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  };
  const chunkSize = 500;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { error } = await tableClient.upsert(chunk, { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  console.log(`${table}: seeded ${rows.length} rows`);
};

export const buildArchiveSeedRows = (timestamp = nowIso()) => {
  const videos = LOCALES.flatMap((locale) =>
    loadDirectOrFallbackData<VideoItem>(locale, 'videos.json').map((item, index) => ({
      public_id: item.id,
      locale,
      title: item.title,
      description: item.description,
      youtube_url: item.youtubeUrl,
      date: toDate(item.date),
      location: item.location ?? '',
      event_type: item.eventType ?? 'camp',
      event_year: item.eventYear ?? 2024,
      thumbnail_url: item.thumbnailUrl ?? null,
      duration: item.duration ?? null,
      musician_ids: item.musicianIds ?? [],
      director_musician_id: item.directorMusicianId ?? null,
      status: 'published',
      sort_order: index,
      published_at: timestamp,
    }))
  );

  const baseGallery = loadGalleryImages<GalleryImage>();
  const gallery = LOCALES.flatMap((locale) =>
    baseGallery.map((item, index) => ({
      public_id: makeGalleryPublicId(item),
      locale,
      image_url: item.url,
      description: item.description ?? null,
      event_type: item.eventType,
      event_year: item.eventYear,
      photographer: item.photographer ?? null,
      status: 'published',
      sort_order: index,
      published_at: timestamp,
    }))
  );

  const press = LOCALES.flatMap((locale) =>
    loadDirectOrFallbackData<PressItem>(locale, 'press.json').map((item, index) => ({
      public_id: item.id,
      locale,
      title: item.title,
      publisher: item.publisher,
      date: toDate(item.date),
      source_url: item.url,
      description: item.description,
      image_url: item.imageUrl ?? null,
      event_type: item.eventType ?? 'album',
      event_year: item.eventYear ?? 2024,
      status: 'published',
      sort_order: index,
      published_at: timestamp,
    }))
  );

  const contentRows = LOCALES.flatMap((locale) =>
    [
      { route: '/videos', namespace: 'videos' },
      { route: '/gallery', namespace: 'gallery' },
      { route: '/press', namespace: 'press' },
    ].flatMap(({ route, namespace }) => {
      const source = loadLocaleJson(locale, namespace);
      const rows = [
        ['seo.title', 'page_title', 'SEO 제목'],
        ['seo.description', 'page_desc', 'SEO 설명'],
        ['hero.title', 'hero_title', '히어로 제목'],
        ['hero.subtitle', 'hero_subtitle', '히어로 부제'],
        ['intro.eyebrow', 'intro.eyebrow', '인트로 라벨'],
        ['intro.heading', 'intro.heading', '인트로 제목'],
        ['intro.p1', 'intro.p1', '인트로 1문단'],
        ['intro.p2', 'intro.p2', '인트로 2문단'],
        ['intro.p3', 'intro.p3', '인트로 3문단'],
      ] as const;

      return rows.map(([placement, sourcePath, label], index) => ({
        key: `${route}.${placement}`,
        locale,
        route_path: route,
        placement,
        label,
        value: pick(source, sourcePath),
        description: null,
        status: 'published',
        sort_order: index,
        published_at: timestamp,
      }));
    })
  );

  return { videos, gallery, press, contentRows };
};

const main = async () => {
  loadLocalEnv();

  const supabaseUrl = mustGetEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = mustGetEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { videos, gallery, press, contentRows } = buildArchiveSeedRows();

  const seedClient = supabase as unknown as UpsertSource;
  await upsertRows(seedClient, 'archive_videos', videos, 'public_id,locale');
  await upsertRows(seedClient, 'archive_gallery_images', gallery, 'public_id,locale');
  await upsertRows(seedClient, 'archive_press_items', press, 'public_id,locale');
  await upsertRows(seedClient, 'cms_content_blocks', contentRows, 'key,locale');
};

if (require.main === module) {
  void main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
