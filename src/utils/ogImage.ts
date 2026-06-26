import { config } from '@/config/env';
import manifest from '@/generated/og-derived-manifest.json';

/**
 * 빌드 시(scripts/generate-og-images.mjs) jpg 파생본이 생성된 webp/avif 원본
 * 경로 집합. SEO 공유 이미지를 카카오톡·페이스북 호환 jpg로 안전하게 매핑하기
 * 위해 사용한다.
 */
const DERIVED = new Set<string>(manifest as string[]);

/** webp/avif 원본 경로 → 파생 jpg 경로 규칙. 빌드 스크립트와 동일해야 한다. */
export function derivedOgPath(src: string): string {
  const rel = src.replace(/^\/?(images-webp|images)\//, '');
  return `/images/og/_derived/${rel.replace(/\.(webp|avif)$/i, '.jpg')}`;
}

/**
 * og:image / twitter:image 용 경로를 호환 가능한 형식으로 정규화한다.
 * 카카오톡·페이스북 OG 크롤러는 webp/avif 를 렌더하지 못하므로:
 *   - 외부 URL(YouTube 썸네일 등)·이미 jpg/png/gif: 그대로 사용
 *   - 빌드가 생성한 파생 jpg가 있으면 그 경로로 치환
 *   - 파생본이 없는 webp/avif: 기본 OG 이미지로 폴백(깨진 썸네일 방지)
 */
export function toOgImage(src?: string | null): string {
  if (!src) return config.ogImage;
  if (/^https?:\/\//i.test(src)) return src;
  if (!/\.(webp|avif)$/i.test(src)) return src;
  return DERIVED.has(src) ? derivedOgPath(src) : config.ogImage;
}
