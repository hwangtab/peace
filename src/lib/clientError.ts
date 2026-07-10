// D1 — 자체 클라이언트 에러 수집기.
//
// 외부 관측 서비스(Sentry 등) 없이, same-origin 엔드포인트 /api/client-error 로
// 런타임 예외를 구조화해 전송한다 → Vercel 함수 로그에서 조회 가능해진다.
// (web-vitals 의 gtag 전송과 달리 광고 차단기에 막히지 않는 자체 경로.)
//
// window.onerror / unhandledrejection 전역 핸들러(_app)와 WidgetErrorBoundary 의
// onError 가 모두 이 함수를 호출한다. 아래의 세션 단위 dedupe/상한이 두 경로의
// 중복 전송과 폭주를 함께 억제한다.

const ENDPOINT = '/api/client-error';
const MAX_MESSAGE = 500;
const MAX_STACK = 2000;
// 세션당 총 전송 상한 — 무한 루프성 에러가 서버 로그를 도배하지 않도록.
const MAX_REPORTS_PER_SESSION = 20;

// 같은 시그니처(kind:message)는 세션당 1회만 전송(전역 핸들러 ↔ ErrorBoundary 중복 제거 포함).
const sentSignatures = new Set<string>();
let totalSent = 0;

export type ClientErrorKind = 'window.onerror' | 'unhandledrejection' | 'react';

export interface ClientErrorReport {
  kind: ClientErrorKind;
  message: string;
  stack?: string;
  componentStack?: string;
}

const truncate = (value: string | undefined, max: number): string | undefined => {
  if (!value) return undefined;
  return value.length > max ? `${value.slice(0, max)}…[truncated]` : value;
};

export function reportClientError(report: ClientErrorReport): void {
  // SSR 컨텍스트·개발 모드에서는 전송하지 않는다(개발은 콘솔/오버레이로 충분).
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;

  const message = (report.message || 'unknown error').slice(0, MAX_MESSAGE);
  const signature = `${report.kind}:${message}`;
  if (sentSignatures.has(signature)) return;
  if (totalSent >= MAX_REPORTS_PER_SESSION) return;
  sentSignatures.add(signature);
  totalSent += 1;

  const payload = {
    kind: report.kind,
    message,
    stack: truncate(report.stack, MAX_STACK),
    componentStack: truncate(report.componentStack, MAX_STACK),
    url: window.location.href.slice(0, 500),
    at: new Date().toISOString(),
  };

  try {
    const body = JSON.stringify(payload);
    // sendBeacon 우선 — 언로드 중에도 전송이 보장되고 메인 스레드를 막지 않는다.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
    // 폴백: keepalive fetch(응답은 무시, 실패해도 조용히 넘어간다).
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* 수집 실패는 무시 */
    });
  } catch {
    // 수집기 자체 예외는 무시 — 관측 장치가 앱을 깨뜨리면 안 된다.
  }
}

/**
 * react-error-boundary 의 onError → 수집기 어댑터.
 * 프로덕션에서 boundary 가 잡은 렌더 예외는 window.onerror 로 전파되지 않으므로,
 * 전역 핸들러가 아닌 이 경로로만 수집된다(페이지/위젯 boundary 공통 사용).
 */
export function reportReactError(error: unknown, info: { componentStack?: string | null }): void {
  reportClientError({
    kind: 'react',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    componentStack: info.componentStack ?? undefined,
  });
}

/** 테스트 전용 — 세션 dedupe/카운터 초기화. */
export function __resetClientErrorReporterForTest(): void {
  sentSignatures.clear();
  totalSent = 0;
}
