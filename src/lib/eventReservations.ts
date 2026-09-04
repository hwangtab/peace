/** Keep Singing for Palestine 공연 slug (event_reservations.event_slug). */
export const EVENT_SLUG = 'keep-singing-for-palestine';

/** 사전 예매 1매 가격(원). 현장 판매(35,000)는 접수 대상이 아니다. */
export const TICKET_PRICE = 30000;

/** 1회 접수 최대 매수. DB check 제약(quantity between 1 and 4)과 동일해야 한다. */
export const MAX_QUANTITY = 4;

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export const RESERVATION_STATUSES: readonly ReservationStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
];

/** 관리자·조회 화면에 쓰는 한국어 상태 라벨. */
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: '입금 대기',
  confirmed: '확정',
  cancelled: '취소',
};

/**
 * 휴대폰 번호를 `010-1234-5678` 형태로 정규화한다.
 * - 숫자 이외 문자는 모두 제거하고, 국가번호(+82 / 82)는 앞의 0으로 되돌린다.
 * - 010으로 시작하는 11자리만 허용(그 외 형식은 null).
 */
export const normalizePhone = (input: string): string | null => {
  if (typeof input !== 'string') return null;
  let digits = input.replace(/\D/g, '');
  // +82 10 1234 5678 → 01012345678
  if (digits.startsWith('82')) digits = `0${digits.slice(2)}`;
  if (!/^010\d{8}$/.test(digits)) return null;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

/** 예매 접수 금액(원). */
export const reservationAmount = (quantity: number): number => quantity * TICKET_PRICE;

/** 이름 비교용 정규화 — 공백 제거 + 소문자화(영문 이름 대소문자 차이 흡수). */
export const normalizeNameForMatch = (name: string): string =>
  name.replace(/\s+/g, '').toLowerCase();

export interface WindowRateLimiter {
  /** key가 windowMs 안에서 max회 미만이면 true(허용)하고 기록한다. */
  allow(key: string, now?: number): boolean;
  size(): number;
}

/**
 * "windowMs 동안 max회" 방식의 in-memory 레이트리미터.
 *
 * postViewRateLimit의 createRateLimiter는 "최소 간격" 방식이라 접수 폼(10분 5회)에는
 * 맞지 않아 별도로 둔다. 한계는 동일하다 — 모듈 스코프 Map이므로 같은 서버 인스턴스에
 * 붙는 요청 사이에서만 동작하는 경량 억제책이다(완전 방어는 외부 저장소 필요).
 */
export function createWindowRateLimiter(
  windowMs: number,
  max: number,
  maxEntries = 10_000
): WindowRateLimiter {
  const hits = new Map<string, number[]>();

  const prune = (now: number): void => {
    for (const [key, stamps] of hits) {
      const live = stamps.filter((ts) => now - ts < windowMs);
      if (live.length === 0) hits.delete(key);
      else hits.set(key, live);
    }
    while (hits.size > maxEntries) {
      const oldest = hits.keys().next().value;
      if (oldest === undefined) break;
      hits.delete(oldest);
    }
  };

  return {
    allow(key: string, now: number = Date.now()): boolean {
      const stamps = (hits.get(key) ?? []).filter((ts) => now - ts < windowMs);
      if (stamps.length >= max) {
        hits.set(key, stamps);
        return false;
      }
      stamps.push(now);
      hits.delete(key);
      hits.set(key, stamps);
      if (hits.size > maxEntries) prune(now);
      return true;
    },
    size(): number {
      return hits.size;
    },
  };
}
