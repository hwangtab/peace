import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * ScrollToTop Component
 *
 * React Router 페이지 전환 시 항상 최상단으로 스크롤하는 컴포넌트
 * Router 내부에서 사용하며, UI를 렌더링하지 않음
 *
 * 사용 위치: App.tsx의 Router 내부, Navigation 아래
 * 예: <Router><ScrollToTop /><Navigation /><Routes /></Router>
 */
const ScrollToTop = () => {
  const router = useRouter();

  useEffect(() => {
    // 라우트 경로 변경 시 페이지 최상단으로 스크롤
    window.scrollTo(0, 0);
  }, [router.asPath]);

  // 이 컴포넌트는 동작만 수행하고 UI를 렌더링하지 않음
  return null;
};

export default ScrollToTop;
