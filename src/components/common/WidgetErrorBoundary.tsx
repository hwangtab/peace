import React from 'react';
import { useTranslation } from 'next-i18next';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { reportReactError } from '@/lib/clientError';

// D2 — 위젯 단위 에러 격리 래퍼.
//
// _app 의 페이지 전역 ErrorBoundary(ErrorFallback)는 한 위젯만 던져도 main 전체를
// 대체한다. 독립 실패 가능한 위젯(댓글·좋아요·갤러리·라이트박스 등)을 이 래퍼로 감싸면
// 해당 위젯 자리에만 경량 인라인 fallback 이 뜨고 나머지 페이지는 살아남는다.
//
// fallback 문구는 translation ns 의 기존 공용 키(common.error_title / common.retry)만
// 재사용한다 — 새 로케일 키를 만들지 않는다(13 로케일 parity 유지). 이 래퍼를 쓰는
// 모든 페이지는 translation ns 를 로드한다.

function WidgetErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="my-4 rounded-xl border border-ocean-sand bg-light-beige/60 px-4 py-4 text-center text-sm text-coastal-gray"
    >
      <p>{t('common.error_title')}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-2 rounded-lg border border-coastal-gray px-3 py-1 text-xs font-semibold text-jeju-ocean transition hover:bg-seafoam"
      >
        {t('common.retry')}
      </button>
    </div>
  );
}

interface Props {
  children: React.ReactNode;
  // 값이 바뀌면 boundary 를 리셋해 위젯을 다시 마운트한다(예: postId 변경 시).
  resetKeys?: unknown[];
}

export default function WidgetErrorBoundary({ children, resetKeys }: Props) {
  return (
    <ErrorBoundary
      FallbackComponent={WidgetErrorFallback}
      resetKeys={resetKeys}
      onError={reportReactError}
    >
      {children}
    </ErrorBoundary>
  );
}
