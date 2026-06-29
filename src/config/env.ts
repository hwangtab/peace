// env 검증은 6개 NEXT_PUBLIC_* 에 대한 단순 형식 체크뿐이라 zod 가 불필요하다.
// zod 를 쓰면 이 모듈을 import 하는 config/getFullUrl 이 거의 모든 페이지에서
// 쓰이는 탓에 zod(~279KB raw)가 _app 전역 청크에 박혀 전 라우트에 로드됐다.
// 경량 수동 검증으로 대체해 클라이언트 번들에서 zod 를 제거한다.
const validateUrl = (key: string, value?: string): string | undefined => {
  if (value === undefined) return undefined;
  try {
    new URL(value);
    return value;
  } catch {
    throw new Error(`Invalid environment variable ${key}: not a valid URL (${value})`);
  }
};

const validateGaId = (value?: string): string | undefined => {
  if (value === undefined) return undefined;
  if (!/^G-[A-Z0-9]+$/.test(value)) {
    throw new Error(`Invalid environment variable NEXT_PUBLIC_GA_MEASUREMENT_ID: ${value}`);
  }
  return value;
};

const parsed = {
  NEXT_PUBLIC_SITE_URL: validateUrl('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SMARTSTORE_URL: validateUrl(
    'NEXT_PUBLIC_SMARTSTORE_URL',
    process.env.NEXT_PUBLIC_SMARTSTORE_URL
  ),
  NEXT_PUBLIC_INSTAGRAM_URL: validateUrl(
    'NEXT_PUBLIC_INSTAGRAM_URL',
    process.env.NEXT_PUBLIC_INSTAGRAM_URL
  ),
  NEXT_PUBLIC_OG_IMAGE: process.env.NEXT_PUBLIC_OG_IMAGE,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: validateGaId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
};

export const config = {
  // trailing slash 를 제거해 단일 정규형으로 보관(sitemap·공유 URL base 로 직접 사용 가능).
  siteUrl: (parsed.NEXT_PUBLIC_SITE_URL ?? 'https://peaceandmusic.net').replace(/\/$/, ''),
  siteName: parsed.NEXT_PUBLIC_SITE_NAME ?? '강정피스앤뮤직캠프',
  smartstoreUrl: parsed.NEXT_PUBLIC_SMARTSTORE_URL ?? 'https://smartstore.naver.com/peaceandmusic',
  instagramUrl:
    parsed.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/peace_music_in_gangjeong',
  ogImage: parsed.NEXT_PUBLIC_OG_IMAGE ?? '/images/og/peace-camp-og.jpg',
  gaMeasurementId: parsed.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const;

export const getFullUrl = (path: string): string => {
  const baseUrl = config.siteUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
