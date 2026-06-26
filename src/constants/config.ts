/**
 * Application Configuration Constants
 */

export const GALLERY_CONFIG = {
  PRIORITY_IMAGE_THRESHOLD: 8,
  // 무한 스크롤 점진 렌더: 초기 표시 개수와 스크롤당 추가 개수.
  // 초기값을 충분히 크게 잡아 미리보기(홈)는 한 번에 다 보이고,
  // 전체 갤러리(/gallery, 수천 장)만 분할 마운트되어 DOM 노드가 제한된다.
  INITIAL_VISIBLE_COUNT: 60,
  LOAD_STEP: 60,
} as const;

export const SITE_CONFIG = {
  NAME: '강정피스앤뮤직캠프',
  NAME_EN: 'Gangjeong Peace & Music Camp',
  SLOGAN: '전쟁을 끝내자! 노래하자, 춤추자',
  DESCRIPTION: '강정마을에서 시작되는 평화의 메시지',
} as const;

export const API_PATHS = {
  GALLERY: '/data/gallery',
} as const;
