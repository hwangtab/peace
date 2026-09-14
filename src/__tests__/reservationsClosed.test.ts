/**
 * 9/19 행사가 거리집회로 바뀌면서 예매 접수를 닫았다(2026-09-14).
 *
 * 화면에서 폼을 내리는 것만으로는 부족하다 — 주소를 아는 사람이나 캐시된 페이지가 남아
 * 있으면 접수가 그대로 들어오고, 아무도 그 돈을 받을 준비가 돼 있지 않다. 서버가
 * 거절하는지를 고정한다.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../lib/supabaseService', () => ({ createSupabaseServiceClient: jest.fn() }));
jest.mock('../lib/resend', () => ({ sendEmail: jest.fn() }));

// eslint-disable-next-line import/first
import handler from '../../pages/api/solidarity/reservations';
// eslint-disable-next-line import/first
import { createSupabaseServiceClient } from '../lib/supabaseService';
// eslint-disable-next-line import/first
import { sendEmail } from '../lib/resend';

const makeRes = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(payload: unknown) { this.body = payload; return this; },
    setHeader() { return this; },
  };
  return res as unknown as NextApiResponse & { statusCode: number; body: { error?: string } };
};

const post = (body: unknown) =>
  ({ method: 'POST', body, headers: {}, socket: {} }) as unknown as NextApiRequest;

describe('예매 접수는 닫혀 있다', () => {
  beforeEach(() => jest.clearAllMocks());

  it('정상 형식으로 신청해도 410으로 거절한다', async () => {
    const res = makeRes();
    await handler(post({ name: '김후원', phone: '010-1234-5678', quantity: 2, privacyAgreed: true }), res);
    expect(res.statusCode).toBe(410);
    expect(res.body.error).toContain('거리집회');
  });

  it('DB에 쓰지도, 메일을 보내지도 않는다 — 거절이 먼저다', async () => {
    const res = makeRes();
    await handler(post({ name: '김후원', phone: '010-1234-5678', quantity: 1, privacyAgreed: true }), res);
    expect(createSupabaseServiceClient).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('POST가 아니면 종전대로 405다 — 닫힘이 메서드 판정을 가리지 않는다', async () => {
    const res = makeRes();
    await handler({ method: 'GET', headers: {}, socket: {} } as unknown as NextApiRequest, res);
    expect(res.statusCode).toBe(405);
  });
});
