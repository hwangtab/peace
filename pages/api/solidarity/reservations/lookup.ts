import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabaseService';
import { getClientIp } from '@/lib/clientIp';
import {
  EVENT_SLUG,
  createWindowRateLimiter,
  lookupBodySchema,
  normalizeNameForMatch,
  normalizePhone,
} from '@/lib/eventReservations';

// IP당 10분에 10회.
const rateLimiter = createWindowRateLimiter(10 * 60_000, 10);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  if (!rateLimiter.allow(getClientIp(req))) {
    res.status(429).json({ error: '조회가 너무 잦습니다. 잠시 후 다시 시도해 주세요.' });
    return;
  }

  let body;
  try {
    body = lookupBodySchema.parse(req.body);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues.map((issue) => issue.message).join('\n')
        : '입력값을 확인해 주세요.';
    res.status(400).json({ error: message });
    return;
  }

  const phone = normalizePhone(body.phone);
  if (!phone) {
    res.status(400).json({ error: '휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요.' });
    return;
  }

  const supabase = createSupabaseServiceClient();
  // 취소 건도 상태를 알려줘야 하므로 status 필터 없이 조회한다.
  // 활성 건은 (event_slug, phone) 유니크라 최대 1건이지만, 취소 이력이 쌓일 수 있어
  // 최근 것부터 받아 이름이 일치하는 첫 건을 쓴다.
  const { data, error } = await supabase
    .from('event_reservations')
    .select('name, status, quantity, created_at')
    .eq('event_slug', EVENT_SLUG)
    .eq('phone', phone)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[solidarity/reservations/lookup] select failed:', error.message);
    res.status(500).json({ error: 'internal_error' });
    return;
  }

  const wanted = normalizeNameForMatch(body.name);
  const rows = (data ?? []) as {
    name: string;
    status: string;
    quantity: number;
    created_at: string;
  }[];
  // 활성 건을 우선 보여주고, 없으면 가장 최근 취소 건을 보여준다.
  const matched =
    rows.find((row) => normalizeNameForMatch(row.name) === wanted && row.status !== 'cancelled') ??
    rows.find((row) => normalizeNameForMatch(row.name) === wanted);

  if (!matched) {
    res.status(404).json({ error: '접수 내역을 찾을 수 없습니다. 이름과 연락처를 확인해 주세요.' });
    return;
  }

  res.status(200).json({
    status: matched.status,
    quantity: matched.quantity,
    createdAt: matched.created_at,
  });
}
