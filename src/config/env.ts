import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().optional(),
  NEXT_PUBLIC_SMARTSTORE_URL: z.string().url().optional(),
  NEXT_PUBLIC_INSTAGRAM_URL: z.string().url().optional(),
  NEXT_PUBLIC_OG_IMAGE: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
});

const parsed = (() => {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SMARTSTORE_URL: process.env.NEXT_PUBLIC_SMARTSTORE_URL,
    NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    NEXT_PUBLIC_OG_IMAGE: process.env.NEXT_PUBLIC_OG_IMAGE,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  });
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${result.error.message}`);
  }
  return result.data;
})();

export const config = {
  siteUrl: parsed.NEXT_PUBLIC_SITE_URL ?? 'https://peaceandmusic.net',
  siteName: parsed.NEXT_PUBLIC_SITE_NAME ?? '강정피스앤뮤직캠프',
  smartstoreUrl: parsed.NEXT_PUBLIC_SMARTSTORE_URL ?? 'https://smartstore.naver.com/peaceandmusic',
  instagramUrl: parsed.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/peace_music_in_gangjeong',
  ogImage: parsed.NEXT_PUBLIC_OG_IMAGE ?? '/images/og/peace-camp-og.jpg',
  gaMeasurementId: parsed.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const;

export const getFullUrl = (path: string): string => {
  const baseUrl = config.siteUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
