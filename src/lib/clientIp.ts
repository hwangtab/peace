import type { NextApiRequest } from 'next';

// 신뢰 가능한 클라이언트 IP 추출(rate limit 키 용도).
//
// x-forwarded-for(XFF)의 leftmost 값은 클라이언트가 임의로 넣을 수 있어 위조 가능하다:
// 프록시는 기존 XFF 헤더 "뒤에" 실제 접속 IP 를 append 하므로, 클라이언트가 미리 채워
// 보낸 leftmost 항목이 그대로 남는다. 따라서 leftmost 를 rate limit 키로 쓰면 매 요청
// 다른 값을 넣어 제한을 우회할 수 있다.
//
// 우선순위:
//   1) x-real-ip — Vercel 엣지가 실제 접속 IP 로 설정하는 헤더(신뢰 가능, 최우선).
//   2) XFF 의 rightmost — 가장 바깥(=우리에게 가장 가까운) 신뢰 프록시가 붙인 값.
//      leftmost 와 달리 클라이언트가 통제하지 못한다.
//   3) socket.remoteAddress — 프록시가 없는 로컬/직결 환경 폴백.
const headerValue = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

export const getClientIp = (req: NextApiRequest): string => {
  const realIp = headerValue(req.headers['x-real-ip'])?.trim();
  if (realIp) return realIp;

  const fwd = headerValue(req.headers['x-forwarded-for']);
  if (fwd) {
    const parts = fwd
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    const rightmost = parts[parts.length - 1];
    if (rightmost) return rightmost;
  }

  return req.socket.remoteAddress ?? 'unknown';
};
