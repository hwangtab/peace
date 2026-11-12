/**
 * Application Configuration Constants
 */

export const GALLERY_CONFIG = {
  PRIORITY_IMAGE_THRESHOLD: 8,
  // 무한 스크롤 점진 렌더: 초기 표시 개수와 스크롤당 추가 개수.
  // 초기값은 미리보기(홈, 최대 16장)를 한 번에 덮을 만큼만 잡고, 전체 갤러리는
  // 작은 배치로 나눠 마운트한다. 예전 60장 단위는 스크롤 중 60개 타일의
  // opacity 애니메이션 + 이미지 디코드가 한꺼번에 몰려 수백 ms 정지를 만들었다.
  INITIAL_VISIBLE_COUNT: 24,
  LOAD_STEP: 24,
} as const;

export const VIDEOS_CONFIG = {
  // 점진 렌더: /videos 는 카드 145개(각 유튜브 썸네일 img 포함)를 전부 SSR 하면
  // HTML 이 ~590KB 로 폭증해 슬로우 4G FCP/LCP 를 망친다. 첫 화면 분량만 카드로
  // SSR 하고 나머지는 스크롤 도달 시 클라이언트에서 카드로 승격한다.
  // 그리드는 데스크톱 3열 → 12개면 4행으로 첫 뷰포트를 채운다.
  // 한 번에 승격하는 카드 수는 12장으로 제한 — 24장은 썸네일 디코드가 몰려
  // 스크롤 중 프레임이 끊겼다.
  INITIAL_VISIBLE_COUNT: 12,
  LOAD_STEP: 12,
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
