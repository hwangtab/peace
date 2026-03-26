// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock react-error-boundary for tests as it might be ESM only
import React from 'react';

type TranslationOptions = {
  returnObjects?: boolean;
};

type MockRouterState = {
  pathname: string;
  route: string;
  query: Record<string, unknown>;
  asPath: string;
  isReady: boolean;
  locale: string;
  push: jest.Mock;
  replace: jest.Mock;
  prefetch: jest.Mock;
  events: {
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
  };
  isFallback: boolean;
};

const testFaqItems = [{ q: 'FAQ question', a: 'FAQ answer' }];

const testTranslations: Record<string, string> = {
  'app.title': '강정피스앤뮤직캠프',
  'nav.logo': '강정피스앤뮤직캠프',
  'nav.home': '홈',
  'nav.camp': '캠프',
  'nav.album': '앨범',
  'nav.gallery': '갤러리',
  'nav.video': '비디오',
  'nav.videos': '비디오',
  'nav.press': '언론보도',
  'nav.open_menu': 'menu',
  'nav.close_menu': 'close menu',
  'nav.skip_to_main': '본문으로 건너뛰기',
  'nav.switch_language': '언어 전환',
  'common.loading': '로딩 중...',
  'common.filter_all': '전체',
  'common.filter_camp_2023': '2023 캠프',
  'common.filter_album_2024': '2024 앨범',
  'common.filter_camp_2025': '2025 캠프',
  'common.filter_camp_2026': '2026 캠프',
  'common.aria_filter': '이벤트 필터',
  'common.aria_filter_selected': '필터(선택됨)',
  'footer.sns_aria': 'Instagram',
  'footer.email_aria': 'Email',
  'footer.menu.home': '홈',
  'footer.menu.gallery': '갤러리',
  'footer.menu.video': '비디오',
  'footer.menu.press': '언론보도',
  'footer.menu.camp_2023': '2023 캠프',
  'footer.menu.camp_2025': '2025 캠프',
  'footer.menu.album_about': '앨범 소개',
  'footer.menu.musicians': '뮤지션',
  'seo.default.title': '강정피스앤뮤직캠프',
  'seo.default.description': '강정피스앤뮤직캠프 소개',
  'seo.default.keywords': '강정, 피스, 뮤직, 캠프',
};

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: TranslationOptions) => {
      if (key === 'faqs.items' && options?.returnObjects) {
        return testFaqItems;
      }

      return testTranslations[key] ?? key;
    },
    i18n: {
      language: 'ko',
      changeLanguage: jest.fn(),
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const createRouterState = (): MockRouterState => ({
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  isReady: true,
  locale: 'ko',
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
});

const mockRouterState = createRouterState();

const setMockRouterState = (overrides: Partial<MockRouterState>): void => {
  Object.assign(mockRouterState, overrides);
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouterState,
  __setMockRouterState: setMockRouterState,
}));

beforeEach(() => {
  Object.assign(mockRouterState, createRouterState());
});

jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children} </div>,
  useErrorBoundary: () => ({ resetBoundary: jest.fn() }),
}));
// Mock framer-motion to skip animations
type MotionComponentProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  initial?: unknown;
  animate?: unknown;
  transition?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  exit?: unknown;
  variants?: unknown;
  layoutId?: string;
};

const stripMotionProps = (props: MotionComponentProps): React.HTMLAttributes<HTMLElement> => {
  const sanitized: MotionComponentProps = { ...props };
  delete sanitized.initial;
  delete sanitized.animate;
  delete sanitized.transition;
  delete sanitized.whileHover;
  delete sanitized.whileTap;
  delete sanitized.exit;
  delete sanitized.variants;
  delete sanitized.layoutId;
  return sanitized;
};

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MotionComponentProps) => (
      <div {...stripMotionProps(props)}>{children}</div>
    ),
    span: ({ children, ...props }: MotionComponentProps) => (
      <span {...stripMotionProps(props)}>{children}</span>
    ),
    button: ({ children, ...props }: MotionComponentProps) => (
      <button {...stripMotionProps(props)}>{children}</button>
    ),
  },
  useInView: jest.fn(() => true),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
