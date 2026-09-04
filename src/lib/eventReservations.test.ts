import {
  EVENT_SLUG,
  MAX_QUANTITY,
  RESERVATION_STATUS_LABELS,
  TICKET_PRICE,
  createWindowRateLimiter,
  normalizeNameForMatch,
  normalizePhone,
  reservationAmount,
} from './eventReservations';
import { lookupBodySchema, reservationBodySchema } from './eventReservationSchemas';

describe('normalizePhone', () => {
  test('다양한 입력을 010-0000-0000 형태로 정규화한다', () => {
    expect(normalizePhone('01012345678')).toBe('010-1234-5678');
    expect(normalizePhone('010-1234-5678')).toBe('010-1234-5678');
    expect(normalizePhone(' 010 1234 5678 ')).toBe('010-1234-5678');
    expect(normalizePhone('+82 10-1234-5678')).toBe('010-1234-5678');
    expect(normalizePhone('82 10 1234 5678')).toBe('010-1234-5678');
  });

  test('휴대폰 형식이 아니면 null', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('0212345678')).toBeNull();
    expect(normalizePhone('0101234567')).toBeNull();
    expect(normalizePhone('010123456789')).toBeNull();
    expect(normalizePhone('없음')).toBeNull();
  });
});

describe('constants & amount', () => {
  test('공연 slug·가격·최대 매수', () => {
    expect(EVENT_SLUG).toBe('keep-singing-for-palestine');
    expect(TICKET_PRICE).toBe(30000);
    expect(MAX_QUANTITY).toBe(4);
  });

  test('금액은 매수 × 30,000', () => {
    expect(reservationAmount(1)).toBe(30000);
    expect(reservationAmount(4)).toBe(120000);
  });

  test('상태 라벨', () => {
    expect(RESERVATION_STATUS_LABELS.pending).toBe('입금 대기');
    expect(RESERVATION_STATUS_LABELS.confirmed).toBe('확정');
    expect(RESERVATION_STATUS_LABELS.cancelled).toBe('취소');
  });
});

describe('reservationBodySchema', () => {
  const valid = {
    name: '  홍길동 ',
    phone: '010-1234-5678',
    quantity: 2,
    privacyAgreed: true,
    depositAgreed: true,
  };

  test('유효한 입력은 이름을 trim 해서 통과', () => {
    expect(reservationBodySchema.parse(valid)).toEqual({ ...valid, name: '홍길동' });
  });

  test('동의 누락·매수 범위·연락처 형식은 거부', () => {
    expect(reservationBodySchema.safeParse({ ...valid, privacyAgreed: false }).success).toBe(false);
    expect(reservationBodySchema.safeParse({ ...valid, depositAgreed: false }).success).toBe(false);
    expect(reservationBodySchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false);
    expect(reservationBodySchema.safeParse({ ...valid, quantity: 5 }).success).toBe(false);
    expect(reservationBodySchema.safeParse({ ...valid, quantity: 1.5 }).success).toBe(false);
    expect(reservationBodySchema.safeParse({ ...valid, phone: '123' }).success).toBe(false);
    expect(reservationBodySchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    expect(reservationBodySchema.safeParse({ ...valid, name: 'ㄱ'.repeat(41) }).success).toBe(
      false
    );
  });
});

describe('lookupBodySchema', () => {
  test('이름+연락처만 받는다', () => {
    expect(lookupBodySchema.parse({ name: ' 홍길동 ', phone: '01012345678' })).toEqual({
      name: '홍길동',
      phone: '01012345678',
    });
    expect(lookupBodySchema.safeParse({ name: '홍길동' }).success).toBe(false);
  });
});

describe('normalizeNameForMatch', () => {
  test('공백·대소문자를 무시한다', () => {
    expect(normalizeNameForMatch(' 홍 길동 ')).toBe('홍길동');
    expect(normalizeNameForMatch('Hong Gildong')).toBe('honggildong');
  });
});

describe('createWindowRateLimiter', () => {
  test('창 안에서 max회까지 허용하고 그 뒤 차단', () => {
    const limiter = createWindowRateLimiter(600_000, 3);
    expect(limiter.allow('ip', 0)).toBe(true);
    expect(limiter.allow('ip', 1)).toBe(true);
    expect(limiter.allow('ip', 2)).toBe(true);
    expect(limiter.allow('ip', 3)).toBe(false);
  });

  test('창이 지나면 다시 허용', () => {
    const limiter = createWindowRateLimiter(600_000, 1);
    expect(limiter.allow('ip', 0)).toBe(true);
    expect(limiter.allow('ip', 599_999)).toBe(false);
    expect(limiter.allow('ip', 600_000)).toBe(true);
  });

  test('키가 다르면 서로 영향이 없다', () => {
    const limiter = createWindowRateLimiter(600_000, 1);
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('b', 0)).toBe(true);
    expect(limiter.size()).toBe(2);
  });
});
