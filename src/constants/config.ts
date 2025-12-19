/**
 * Application Configuration Constants
 */

export const GALLERY_CONFIG = {
  INITIAL_VISIBLE_COUNT: 12,
  LOAD_MORE_COUNT: 12,
  PRIORITY_IMAGE_THRESHOLD: 8,
} as const;

export const SITE_CONFIG = {
  NAME: '강정피스앤뮤직캠프',
  NAME_EN: 'Gangjeong Peace & Music Camp',
  COPYRIGHT_YEAR: new Date().getFullYear(),
  SLOGAN: '전쟁을 끝내자! 노래하자, 춤추자',
  DESCRIPTION: '강정마을에서 시작되는 평화의 메시지',
} as const;

export const API_PATHS = {
  GALLERY: '/data/gallery',
} as const;
