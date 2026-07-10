import type { NextApiRequest, NextApiResponse } from 'next';
import { createRateLimiter } from '@/lib/postViewRateLimit';
import { getClientIp } from '@/lib/clientIp';

// D1 — 자체 클라이언트 에러 수집 엔드포인트.
//
// 클라이언트(window.onerror / unhandledrejection / ErrorBoundary)가 보낸 런타임 예외를
// 구조화해 console.error('[client-error]', ...) 로 출력한다 → Vercel 함수 로그에서
// '[client-error]' 로 검색·필터할 수 있다. 외부 관측 서비스 없이 최소 관측성 확보.

// 남용 방지: IP당 최소 간격 rate limit(board/view 와 동일한 in-memory limiter 재사용).
// 클라이언트도 dedupe·상한을 두지만, 서버는 IP 단위 flood 를 억제한다. 1초 간격이라
// 같은 IP 의 동시다발 에러 중 첫 건만 기록될 수 있으나(관측 손실 최소), 로그 도배는 막힌다.
const RATE_LIMIT_MS = 1_000;
const RATE_LIMIT_MAX_ENTRIES = 5_000;
const rateLimiter = createRateLimiter(RATE_LIMIT_MS, RATE_LIMIT_MAX_ENTRIES);

const MAX_MESSAGE = 500;
const MAX_STACK = 2000;
const MAX_FIELD = 500;

const str = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.slice(0, max) : '';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  // Flood 억제. 차단돼도 정보를 흘리지 않도록 성공처럼 204 로 응답.
  if (!rateLimiter.allow(getClientIp(req))) {
    res.status(204).end();
    return;
  }

  // sendBeacon(Blob type application/json) 은 object 로 파싱되지만, content-type 이
  // 인식되지 않으면 string 으로 올 수 있어 둘 다 처리한다.
  let body: unknown;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'invalid_json' });
    return;
  }
  if (typeof body !== 'object' || body === null) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }

  const b = body as Record<string, unknown>;
  const entry = {
    kind: str(b.kind, 40) || 'unknown',
    message: str(b.message, MAX_MESSAGE) || 'unknown error',
    url: str(b.url, MAX_FIELD),
    stack: str(b.stack, MAX_STACK),
    componentStack: str(b.componentStack, MAX_STACK),
    // userAgent 요약 — 전체가 아닌 앞부분만(로그 부피/PII 최소화).
    userAgent: str(req.headers['user-agent'], 200),
    at: new Date().toISOString(),
  };

  // 구조화 출력 — Vercel 함수 로그에서 조회 가능.
  console.error('[client-error]', JSON.stringify(entry));

  res.status(204).end();
}

// 4KB 초과 body 는 프레임워크 단에서 413 으로 거절(남용 방지). 클라이언트가 이미
// stack/message 를 트렁케이트하므로 정상 페이로드는 이 한도 안에 들어온다.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4kb',
    },
  },
};
