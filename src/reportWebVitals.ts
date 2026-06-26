import type { Metric } from 'web-vitals';

// web-vitals v3+ API: getFID(deprecated) 제거, INP(상호작용 지연)가 핵심 지표로 대체됨.
// onCLS/onLCP/onINP/onFCP/onTTFB 는 콜백에 Metric 객체를 전달한다.
const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onINP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
