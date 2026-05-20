# Qwen Code Context — peace (dear-stranger-archive)

## 프로젝트 개요

**peace**(프로젝트명: dear-stranger-archive)는 [peaceandmusic.net](https://peaceandmusic.net) 도메인에서 서비스되는 **강정 평화 음악 캠프**의 공식 웹사이트입니다. 제주의 평화, 음악, 예술을 주제로 한 캠프의 아카이브 및 홍보 목적의 사이트입니다.

Next.js (v16+) 기반의 정적/반정적(S SG + ISR) 웹사이트로, 다국어(i18n, 13개 언어)를 지원합니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16+ (pages router) |
| 언어 | TypeScript 5.7.3 (strict mode) |
| UI | React 18, Tailwind CSS 3.x |
| 애니메이션 | framer-motion (domMax feature, lazy loading) |
| i18n | next-i18next (namespace 분리, 13개 언어, fallbackLng: false) |
| 테스트 | Jest 29 + @testing-library/react 14 |
| 오디오 | howler.js |
| 검증 | Zod v4 |
| SEO | next-sitemap, JSON-LD structured data |
| 분석 | Google Analytics 4 (core web vitals 보고 포함) |
| 포맷팅/린트 | Prettier, ESLint 9 (flat config, eslint-config-next) |

## 프로젝트 구조 (핵심)

```
peace/
├── pages/                  # Next.js pages router
│   ├── index.tsx           # 홈 (ISR revalidate: 3600s)
│   ├── _app.tsx            # 전역 레이아웃 (Navigation, Footer, ErrorBoundary, GA4, i18n)
│   ├── _document.tsx
│   ├── album/              # 앨범/음악가/트랙 관련 페이지군
│   ├── camps/              # 캠프 아카이브 (연도별, 예: /camps/2026)
│   ├── gallery.tsx         # 갤러리 페이지
│   ├── videos.tsx          # 비디오 목록
│   ├── videos/[id].tsx     # 비디오 상세
│   ├── press.tsx           # 언론 보도
│   └── 404.tsx             # .NotFound
├── src/
│   ├── components/         # React 컴포넌트 (카테고리별 디렉토리)
│   │   ├── home/           # HeroSection, AboutSection, GallerySection 등
│   │   ├── camp/           # 캠프 전용 컴포넌트 (GangjeongStorySection 등)
│   │   ├── album/          # 앨범/음악가 관련 컴포넌트
│   │   ├── layout/         # Navigation, Footer, SectionWave
│   │   ├── common/         # ErrorFallback 등 공용 컴포넌트
│   │   └── ...             # gallery, musicians, press, timeline, tracks, videos, shared
│   ├── config/             # 환경 변수 등
│   ├── constants/          # 로케일, 상수
│   ├── context/            # NavigationContext 등
│   ├── data/               # 정적 데이터 (JSON 파싱)
│   ├── hooks/              # 커스텀 훅
│   ├── i18n/               # i18next 설정, stress postprocessor
│   ├── types/              # TypeScript 타입 정의 (GalleryImage 등)
│   └── utils/              # 데이터 로더, 구조화 데이터 생성기 등
├── public/
│   ├── data/*.json         # gallery, musicians, tracks, videos, press 정적 JSON 데이터
│   ├── locales/            # i18n 번역 파일 (namespace별)
│   ├── fonts/              # 커스텀 폰트 (GMarketSans, BookkMyungjo-Bd 등 7종)
│   ├── images-webp/        # WebP 이미지
│   └── audio/              # 오디오 파일
├── scripts/                # 빌드 스크립트 (sitemap, artist-cards, timetable 변환, 폰트 서브셋팅)
├── patches/                # Next.js 패치 (polyfill module 빈 파일 patch)
└── next.config.js          # Next 설정 (헤더, 리다이렉트, modularizeImports, 이미지 최적화 등)
```

## 빌드 및 실행

| 스크립트 | 설명 |
|----------|------|
| `pnpm dev` | 개발 서버 (Next.js dev mode) |
| `pnpm start` | 프로덕션 서버 (`next start`) |
| `pnpm build` | SSG 빌드 (`next build`, prebuild: sitemap 생성) |
| `pnpm test` | Jest 테스트 (watch 모드) |
| `pnpm lint` | ESLint 실행 (`src pages` 대상) |
| `pnpm lint:fix` | ESLint 자동 수정 |
| `pnpm format` | Prettier 전체 포맷팅 |
| `pnpm format:check` | Prettier 체크 (CI용) |
| `pnpm i18n:extract` | i18next 번역 키 추출 |
| `pnpm i18n:check` | 번역 키 parity 검사 (`--fail-on-warnings`) |
| `pnpm analyze` | 번들 분석 (`ANALYZE=true next build`) |

## 개발 관례

- **스타일**: Tailwind CSS utility-first. 커스텀 폰트 7종 + 제주 테마 색상(Ocean Blues, Sky Blues, Sunlight Accents).
- **i18n**: namespace별 SSG payload 분리. `fallbackLng: false` — 모든 namespace의 모든 키가 13개 언어에서 100% parity 보장 필요. `t('group.key')` 그룹핑 관례.
- **폰트**: `src/index.css`에서 `@font-face`로 GMarketSans, BookkMyungjo-Bd, PartialSans, KkuBulLim, S-CoreDream-3Light 등 정의. semantic typography 클래스(`font-display`, `font-body`, `font-caption`) 제공.
- **이미지**: Next.js `<Image>` 사용. WebP + AVIF 포맷 지원. LCP 최적화를 위해 정적 이미지 캐시 TTL 30일.
- **SEO**: 각 페이지에서 JSON-LD structured data(WebSite, Organization, FAQ, HowTo, MusicGroup, WebPage) 생성. sitemap 자동 생성.
- **인증/보안**: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy 헤더 적용.
- **에러 처리**: `react-error-boundary`로 전역 에러 폴백.
- **애니메이션**: framer-motion은 `LazyMotion`으로 비동기 로딩, OS `prefers-reduced-motion` 존중(`reducedMotion="user"`).

### ESLint 핵심 규칙
- `@typescript-eslint/no-explicit-any`: **error**
- `@typescript-eslint/no-unused-vars`: warn (`_` 접두사 무시)
- `react-hooks/exhaustive-deps`: **error**
- `react/self-closing-comp`: **error**
- `jsx-a11y/*`: strict (alt-text, aria-role 등)
- `no-console`: warn (`warn`, `error`만 허용)

### Prettier 관례
- 세미콜론 강제, 단일 인용문, 줄바꿈 100자, ES5 trailing comma, 스페이스 탭(2칸)

## 데이터 흐름

- **정적 데이터**: `public/data/*.json` (gallery, musicians, tracks, videos, press) → `src/utils/dataLoader.load*()`로 읽음
- **i18n 번역**: `public/locales/<lang>/<namespace>.json` → `next-i18next` SSG 시 `serverSideTranslations()`로 페이지에 주입
- **ISR**: 홈 페이지 기준 revalidate 3600초 (1시간). 기타 페이지는 별도 설정 확인 필요.

## 중요 파일들

| 파일 | 용도 |
|------|------|
| `pages/_app.tsx` | 전역 레이아웃, GA4, ErrorBoundary, i18n, MotionConfig |
| `next.config.js` | Next 설정, 보안 헤더, 리다이렉트, 이미지 최적화 |
| `next-i18next.config.js` | 다국어 설정 (13 로케일, namespace 분리, fallbackLng: false) |
| `tailwind.config.js` | 커스텀 폰트, 색상 테마, 배경 그라디언트 정의 |
| `tsconfig.json` | strict mode, `@/*` → `src/*` path alias, bundler module resolution |
| `src/setupTests.tsx` | Jest 테스트 환경 설정 |

## git worktree 주의사항

`.gitignore`에 `naughty-carson/`, `friendly-northcutt/` 등 이름이 랜덤화된 worktree 디렉터리가 명시되어 있습니다. 기존 worktree 복원 시 해당 이름을 유지해야 합니다.
