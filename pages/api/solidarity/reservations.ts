import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabaseService';
import { getClientIp } from '@/lib/clientIp';
import { sendEmail } from '@/lib/resend';
import {
  EVENT_SLUG,
  createWindowRateLimiter,
  normalizePhone,
  reservationAmount,
} from '@/lib/eventReservations';
import { reservationBodySchema } from '@/lib/eventReservationSchemas';

// IP당 10분에 5회. 모듈 스코프 in-memory이므로 같은 인스턴스 내에서만 유효한 경량 억제책.
const rateLimiter = createWindowRateLimiter(10 * 60_000, 5);

const ADMIN_MAIL_TO = 'onethehuman@gmail.com';
const ADMIN_MAIL_FROM = '강정 피스앤뮤직캠프 <admin@peaceandmusic.net>';
const ADMIN_LINK = 'https://peaceandmusic.net/admin/reservations';

const notifyAdmin = async (row: {
  name: string;
  phone: string;
  quantity: number;
  amount: number;
  createdAt: string;
}): Promise<void> => {
  // 키가 없는 환경(로컬·프리뷰)에서는 조용히 건너뛴다.
  if (!process.env.RESEND_API_KEY) return;
  const receivedAt = new Date(row.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  await sendEmail({
    from: ADMIN_MAIL_FROM,
    to: ADMIN_MAIL_TO,
    subject: `[예매 접수] ${row.name} · ${row.quantity}매`,
    text: [
      'Keep Singing for Palestine 예매가 접수되었습니다.',
      '',
      `이름(입금자명): ${row.name}`,
      `연락처: ${row.phone}`,
      `매수: ${row.quantity}매`,
      `입금액: ${row.amount.toLocaleString('ko-KR')}원`,
      `접수시각: ${receivedAt}`,
      '',
      `관리자: ${ADMIN_LINK}`,
    ].join('\n'),
  });
};

/**
 * 예매 접수를 닫는다 — 2026-09-14.
 *
 * Keep Singing for Palestine(9/19)이 실내 유료 공연에서 거리집회로 바뀌면서 팔 티켓이
 * 없어졌다. 화면에서 폼을 내렸지만 **이 주소는 여전히 신청을 받는다** — 주소를 아는
 * 사람이나 캐시된 페이지가 남아 있으면 접수가 들어오고, 아무도 그 돈을 받을 준비가
 * 돼 있지 않다. 그래서 서버에서 닫는다.
 *
 * 이 엔드포인트는 EVENT_SLUG 하나에만 매여 있어(위 import) 다른 공연에 재사용하려면
 * 어차피 손봐야 한다. 그때 이 플래그를 걷어내면 된다. 조회(reservations/[...])와
 * 관리자 경로는 그대로 둔다 — 지난 접수를 확인할 수 있어야 한다(현재 0건이지만).
 */
const RESERVATIONS_CLOSED = true;
const CLOSED_MESSAGE = '9월 19일 행사는 거리집회로 바뀌어 예매를 받지 않습니다. 후원으로 함께해 주세요.';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  if (RESERVATIONS_CLOSED) {
    res.status(410).json({ error: CLOSED_MESSAGE });
    return;
  }

  if (!rateLimiter.allow(getClientIp(req))) {
    res.status(429).json({ error: '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.' });
    return;
  }

  let body;
  try {
    body = reservationBodySchema.parse(req.body);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues.map((issue) => issue.message).join('\n')
        : '입력값을 확인해 주세요.';
    res.status(400).json({ error: message });
    return;
  }

  // 스키마에서 형식은 이미 검증했으므로 여기서 null이 나올 수 없다(타입 좁히기용 방어).
  const phone = normalizePhone(body.phone);
  if (!phone) {
    res.status(400).json({ error: '휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요.' });
    return;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('event_reservations')
    .insert({
      event_slug: EVENT_SLUG,
      name: body.name,
      phone,
      quantity: body.quantity,
      client_ip: getClientIp(req),
    })
    .select('id, quantity, created_at')
    .single();

  if (error) {
    // 23505: (event_slug, phone) 활성 유니크 인덱스 위반 = 이미 접수된 연락처.
    if (error.code === '23505') {
      res.status(409).json({ code: 'duplicate', error: '이미 접수된 연락처입니다.' });
      return;
    }
    console.error('[solidarity/reservations] insert failed:', error.message);
    res.status(500).json({ error: 'internal_error' });
    return;
  }

  const amount = reservationAmount(data.quantity as number);

  // 알림 메일 실패가 접수 성공을 취소시키지 않는다(로그만 남긴다).
  try {
    await notifyAdmin({
      name: body.name,
      phone,
      quantity: data.quantity as number,
      amount,
      createdAt: data.created_at as string,
    });
  } catch (mailError) {
    console.error('[solidarity/reservations] admin notification failed:', mailError);
  }

  res.status(201).json({ id: data.id, quantity: data.quantity, amount });
}
