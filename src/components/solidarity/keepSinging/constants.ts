/**
 * Keep Singing for Palestine (2026-09-19) 공개 페이지 전용 상수·헬퍼.
 *
 * 가격·계좌·최대 매수는 이 공연에만 해당하므로 전역 설정이 아니라 페이지 옆에 둔다.
 */

/** 예매 API 가 쓰는 이벤트 slug. */
export const EVENT_SLUG = 'keep-singing-for-palestine';

/** 사전 예매 1매 가격(원). 현장 구매는 35,000원이지만 폼에서는 쓰지 않는다. */
export const TICKET_PRICE = 30000;

/** 1인당 신청 가능한 최대 매수. API 의 zod 스키마와 같은 값이어야 한다. */
export const MAX_QUANTITY = 4;
export const MIN_QUANTITY = 1;

/** 후원·입금 계좌. 화면 표기와 복사 텍스트가 같다. */
export const ACCOUNT_TEXT = '농협 352-2296-3136-63 장O나';

/** 포스터 톤에서 따온 페이지 로컬 팔레트(팔레스타인 국기 4색 + 웜 화이트). */
export const PALETTE = {
  bg: '#0a0a0a',
  red: '#CE1126',
  green: '#007A3D',
  text: '#F5F1EA',
  muted: '#9C958B',
} as const;

/** 지도 검색 링크(장소명 검색 — 좌표가 바뀌어도 깨지지 않는다). */
export const VENUE_QUERY = '서울 종로구 삼일대로17길 23';
export const NAVER_MAP_URL = `https://map.naver.com/p/search/${encodeURIComponent(VENUE_QUERY)}`;
export const KAKAO_MAP_URL = `https://map.kakao.com/?q=${encodeURIComponent(VENUE_QUERY)}`;

/** 문의 창구 — 다른 연대공연과 동일. */
export const CONTACT_URL = 'https://open.kakao.com/me/Alfseoul';

/**
 * 입력 중인 휴대폰 번호에 하이픈을 자동으로 넣는다.
 * 숫자만 남긴 뒤 3-4-4 로 끊으며, 11자리를 넘는 입력은 잘라낸다.
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 010-0000-0000 형태인지 검사한다(제출 전 인라인 검증용). */
export function isValidPhone(value: string): boolean {
  return /^01[016789]-\d{3,4}-\d{4}$/.test(value.trim());
}

/** 금액을 로케일에 맞는 원화 표기로 변환한다(예: ₩120,000). */
export function formatAmount(amount: number, locale: string): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  };
  try {
    return new Intl.NumberFormat(locale, options).format(amount);
  } catch {
    return new Intl.NumberFormat('ko-KR', options).format(amount);
  }
}
