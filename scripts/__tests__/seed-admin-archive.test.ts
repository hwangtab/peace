import fs from 'fs';
import path from 'path';
import { buildArchiveSeedRows } from '../seed-admin-archive';
import { LOCALES, type Locale } from '../../src/constants/locales';
import { readJsonArray } from '../../src/utils/dataLoader';
import type { PressItem } from '../../src/types/press';
import type { VideoItem } from '../../src/types/video';

const localizedDataPath = (locale: Locale, filename: string): string =>
  locale === 'ko'
    ? path.join(process.cwd(), 'public', 'data', filename)
    : path.join(process.cwd(), 'public', 'data', locale, filename);

const directCount = <T>(locale: Locale, filename: string): number => {
  const filePath = localizedDataPath(locale, filename);
  return fs.existsSync(filePath) ? readJsonArray<T>(filePath).length : 0;
};

const uniquePairs = (rows: Record<string, unknown>[]) =>
  new Set(rows.map((row) => `${row.public_id}:${row.locale}`));

test('builds archive seed rows for every supported locale', () => {
  const rows = buildArchiveSeedRows('2026-06-17T00:00:00.000Z');

  const expectedVideoCount = LOCALES.reduce(
    (total, locale) => total + directCount<VideoItem>(locale, 'videos.json'),
    0
  );
  const expectedPressCount = LOCALES.reduce(
    (total, locale) => total + directCount<PressItem>(locale, 'press.json'),
    0
  );
  expect(rows.videos).toHaveLength(expectedVideoCount);
  expect(rows.press).toHaveLength(expectedPressCount);
  expect(rows.contentRows).toHaveLength(LOCALES.length * 3 * 9);
  expect(uniquePairs(rows.videos).size).toBe(rows.videos.length);
  expect(uniquePairs(rows.press).size).toBe(rows.press.length);
  expect(rows.videos.every((row) => typeof row.location === 'string')).toBe(true);
});

test('keeps translated seed rows separate from Korean rows', () => {
  const rows = buildArchiveSeedRows('2026-06-17T00:00:00.000Z');
  const koVideo = rows.videos.find((row) => row.public_id === 1 && row.locale === 'ko');
  const enVideo = rows.videos.find((row) => row.public_id === 1 && row.locale === 'en');

  expect(koVideo?.title).toContain('김동산');
  expect(enVideo?.title).toContain('Kim Dongsan');
  expect(enVideo?.title).not.toBe(koVideo?.title);
});
