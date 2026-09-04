import { z } from 'zod';

import { MAX_QUANTITY, normalizePhone } from './eventReservations';

/**
 * 예매 API 요청 본문 zod 스키마 — **API 라우트 전용 모듈**.
 *
 * 상수·헬퍼(eventReservations.ts)와 분리해 둔 이유: /admin/reservations 같은 클라이언트
 * 페이지가 상수만 import 해도 zod(~100KB gzip) 전체가 페이지 번들에 딸려 들어갔다.
 * 이 모듈을 eventReservations.ts 에서 re-export 하면 분리가 무의미해지니 하지 말 것.
 */

const phoneField = z
  .string()
  .trim()
  .min(1, '연락처를 입력해 주세요.')
  .max(30, '연락처가 너무 깁니다.')
  .refine((value) => normalizePhone(value) !== null, {
    message: '휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요.',
  });

const nameField = z
  .string()
  .trim()
  .min(1, '입금자명을 입력해 주세요.')
  .max(40, '이름은 40자 이내로 입력해 주세요.');

/** POST /api/solidarity/reservations 요청 본문. */
export const reservationBodySchema = z.object({
  name: nameField,
  phone: phoneField,
  quantity: z
    .number()
    .int('매수는 정수여야 합니다.')
    .min(1, '최소 1매부터 신청할 수 있습니다.')
    .max(MAX_QUANTITY, `최대 ${MAX_QUANTITY}매까지 신청할 수 있습니다.`),
  privacyAgreed: z.literal(true, { message: '개인정보 수집·이용에 동의해 주세요.' }),
  depositAgreed: z.literal(true, { message: '입금 안내를 확인해 주세요.' }),
});

export type ReservationBody = z.infer<typeof reservationBodySchema>;

/** POST /api/solidarity/reservations/lookup 요청 본문. */
export const lookupBodySchema = z.object({
  name: nameField,
  phone: phoneField,
});

export type LookupBody = z.infer<typeof lookupBodySchema>;
