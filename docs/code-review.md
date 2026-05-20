# 강정피스앤뮤직캠프 웹사이트 — 종합 코드리뷰 및 개선점

> 리뷰일: 2026-05-19 | 대상: Pages Router 기반 Next.js 16 프로젝트 (~164개 TS/TSX 파일)

---

## ✅ 이미 잘 되어 있는 부분

### 보안 헤더 — 완벽
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- 정적 리소스별 캐시 헤더 (fonts, images, audio, data, locales) 적절히 구분

### i18n 구조 — 인상적
- 13개 언어 지원, 네임스페이스 단위 분리 (11개 namespace)
- `fallbackLng: false`로 SSG payload 최적화 (-30~50KB/페이지)
- 페이지 단위 `serverSideTranslations`로 번들 불필요 방지

### SEO —ครบ족족
- OG, Twitter Card, JSON-LD structured data (Website, Organization, FAQ, HowTo, MusicGroup, WebPage)
- canonical URL, `hrefLang` alternate, `x-default`
- Naver Search Console 인증, sitemap 연동

### 퍼포먼스 최적화 — 세심함
- `framer-motion`: `LazyMotion` + `domMax` 비동기 청크 (첫 페인트에서 19KB 절감)
- `howler`: 동적 `import()`로 오디오 재생 시점까지 로딩 지연
- font preload (`GMarketSansLight`, `PartialSansKR`) with `fetchpriority="high"`
- `next/image` quality 설정, `minimumCacheTTL: 30일`, 이미지Sizes/qualities 명시

### 코드 품질
- ESLint 규칙 견고 (`strict`, `exhaustive-deps`, `jsx-a11y`, `no-explicit-any`)
- `console.log` 완전 제로 (운영 환경 유출 위험 없음)
- `react-error-boundary`로 전역 에러 폴백

### 접근성
- Skip-to-main-link (`#main-content`), `aria-label`, `aria-expanded`, `aria-controls`
- `focus-visible:outline-none focus-visible:ring-*` 일관된 포커스 스타일
- `prefers-reduced-motion` 준수 (`useReducedMotion` + `MotionConfig.reducedMotion="user"`)

---

## 🔴 Priority 1: 즉시 개선 필요

### 1.1 Jest 버전 불일치 — 보안/호환성 리스크

| 항목 | 값 |
|------|-----|
| 현재 | Jest 27.x (`"^27.5.1"`) |
| 프로젝트 | Next.js 16 + React 18.3 |

**문제:**
- Jest 27는 React 18.3+에서 `act()` 경고, SyntheticEvent 호환성 문제 발생
- React 19로 업그레이드 시 테스트 전체 무용지물화
- `next/jest` helper가 Next 16에서 Jest 27와 안정적으로 동작하지 않을 수 있음

**대안:**
1. **Vitest 마이그레이션 (권장)** — Next.js + Vitest 환경 설정이 간소화됨. 테스트 속도 5~10배 개선
2. 최소한 Jest 29로 업그레이드 후 React 19 테스트 실행

```bash
# Vitest 예시
pnpm add -D vitest @testing-library/jest-dom jsdom happy-dom
# jest.config.js → vitest.config.ts
```

---

### 1.2 `suppressHydrationWarning` 남용 가능성

**위치:** `src/components/layout/Footer.tsx:17`

```tsx
const [year, setYear] = useState(SITE_CONFIG.COPYRIGHT_YEAR);
useEffect(() => { setYear(new Date().getFullYear()); }, []);
// ...
<span suppressHydrationWarning>{year}</span>
```

**문제:**
- SSR 시 `SITE_CONFIG.COPYRIGHT_YEAR`(2026) 렌더링 → 클라이언트에서 `useEffect`로 2026(현재 연도)로 변경
- 현재는 빌드 연도 = 운영 연도로 우연히 일치하지만, 내년 빌드 시 **hydration mismatch** 발생
- `suppressHydrationWarning`은 symptoms 만 감추고 근본 원인을 무시

**대안:**
```tsx
// _document.tsx 에서 직접 계산 (SSR/CSR 모두 동일 값)
class MyDocument extends Document {
  static override async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      currentYear: new Date().getFullYear(), // ← 여기서 계산
    };
  }

  override render() {
    // ...
    <p>© {this.props.currentYear} {t('app.title')}</p>
  }
}
```

---

### 1.3 `as unknown as` 타입 단언 2곳 — 타입 안전성 붕괴

**위치:**
- `src/pages/CampDetailPage.tsx:68`: `t: t as unknown as SchemaT`
- `src/pages/Camp2026Page.tsx:60`: `t(key, vars as Record<string, unknown>) as unknown as string`

**위험:**
- 타입 컴파일러가 모든 오류를 숨김 — 런타임에 키 존재 여부만 확인
- i18n 키 리팩토링 시 타입 체인 보호 완전 무력화

**대안 (CampDetailPage):**
```tsx
// ❌ 현재
const structuredData = getWebSiteSchema(t as unknown as SchemaT);

// ✅ 권장: 래퍼 함수 생성
const schemaT = (key: string, ...rest: unknown[]) => t(key, ...(rest as [])) as string;
const structuredData = getWebSiteSchema(schemaT);
```

**대안 (Camp2026Page):**
```tsx
// ❌ 현재
t(key, vars as Record<string, unknown>) as unknown as string

// ✅ 권장: 제네릭 헬퍼
function tSafe(key: string, vars?: Record<string, unknown>): string {
  return t(key, vars ?? {}) as string;
}
const value = tSafe(key, vars);
```

---

### 1.4 환경변수 검증 미비 — 빌드 시 실패하지 않는 위험

**위치:** `src/config/env.ts`

```tsx
export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://peaceandmusic.net',
  // ...
} as const;
```

**문제:**
- 모든 환경변수가 silent fallback → 오타 또는 누락 시 모르고 운영
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`는 `_app.tsx`에서 정규식 검증하지만, 다른 변수는 전무

**대안: zod 스키마 검증 + 빌드 체크**

```tsx
// src/config/env.ts
import { z } from 'zod';

export const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('https://peaceandmusic.net'),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1),
  NEXT_PUBLIC_OG_IMAGE: z.string().min(1),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = (() => {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
      NEXT_PUBLIC_OG_IMAGE: process.env.NEXT_PUBLIC_OG_IMAGE,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    });
  } catch (err) {
    console.error('❌ Invalid environment variables:', err);
    throw err; // 빌드 실패
  }
})();
```

```json
// package.json
{
  "scripts": {
    "prebuild": "node scripts/validateEnv.js && node scripts/generateSitemap.js"
  }
}
```

---

## 🟡 Priority 2: 단기 개선 (1~2주)

### 2.1 테스트 커버리지 부족 — 6%

| 카테고리 | 파일 수 | 테스트 파일 | 커버리지 |
|----------|---------|-------------|----------|
| components | ~60 | 5 | ~8% |
| api | 6 | 1 | ~17% |
| hooks | ~5 | 0 | **0%** |
| utils | ~10 | 3 | ~30% |
| pages | ~15 | 0 | **0%** |

**전체: 10/164 파일 (~6%)**

**우선순위 테스트 작성:**

1. `src/api/client.ts` — `fetchLocalizedData` 병합 로직, timeout, 에러 처리
2. `src/hooks/useAudioPlayer.ts` — Howl lifecycle, 메모리 누수 방지 검증
3. `src/utils/dataLoader.ts` — `loadGalleryImages`, localized fallback
4. `src/api/press.ts` — `normalizePressItems` (이미 테스트 있음 → 확장)

```tsx
// 예시: client.test.ts
describe('fetchLocalizedData', () => {
  it('returns Korean data for ko locale without merge', async () => { ... });
  it('falls back to English for non-KO locale when localized missing', async () => { ... });
  it('throws when no data file exists for any language', async () => { ... });
  it('merges data by idKey with priority order (localized > en > default)', async () => { ... });
  it('aborts after FETCH_TIMEOUT_MS (10s)', async () => { ... });
});
```

---

### 2.2 `dangerouslySetInnerHTML` — 정적 분석 어려움

**위치:** 2곳
- `src/components/shared/SEOHelmet.tsx:104`
- `src/components/shared/StructuredDataScripts.tsx:36`

**현재:** `escapeJsonLd`로 HTML 이스케이프 후 삽입하므로 XSS 위험은 낮음

```tsx
// 현재 방식 — 안전하지만 정적 분석 어려움
const json = escapeJsonLd(JSON.stringify(data));
<script dangerouslySetInnerHTML={{ __html: json }} />
```

**대안 1: `jsonld` 라이브러리 사용**
```bash
pnpm add jsonld
```
```tsx
import jsonld from 'jsonld';
// jsonld.stringify(data) — 검증 + 직렬화 동시에
```

**대안 2: 빌드 타임에 JSON-LD 파일 생성 (권장)**
```tsx
// scripts/generateStructuredData.js
// 각 페이지의 structuredData → public/structured-data/{page}.json 으로 저장
// 클라이언트에서 fetch 후 렌더 (SSG 시점에 검증 가능)
```

---

### 2.3 중복 데이터 로딩 패턴

| 모듈 | 용도 | 특징 |
|------|------|------|
| `src/api/client.ts` | 클라이언트 측 `fetch` | timeout, 에러 래핑, localization |
| `src/utils/dataLoader.ts` | 서버 측 `fs.readFileSync` | SSG `getStaticProps`에서 사용 |

**문제:** 두 모듈이 동일한 검증 로직(JSON parsing, isArray check, empty/not_found 처리)을 복사

**대안: 공통 유틸리티로 통합**

```ts
// src/utils/jsonReader.ts (공통)
export interface JsonArrayResult<T> {
  status: 'ok' | 'empty' | 'not_found';
  data: T[];
}

export function parseJsonArray<T>(raw: string): JsonArrayResult<T> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw createError('Invalid JSON');
  }
  if (!Array.isArray(parsed)) throw createError('Expected array');
  return { status: parsed.length === 0 ? 'empty' : 'ok', data: parsed as T[] };
}

// src/utils/dataLoader.ts (서버)
export const readJsonArray = <T>(filePath: string): T[] => {
  const content = fs.readFileSync(filePath, 'utf8');
  return parseJsonArray<T>(content).data;
};

// src/api/client.ts (클라이언트)
export const fetchLocalData = async <T>(path: string): Promise<T[]> => {
  const response = await fetch(path);
  const text = await response.text();
  return parseJsonArray<T>(text).data;
};
```

---

### 2.4 Button 컴포넌트 — 과도한 DOM 래퍼

**위치:** `src/components/common/Button.tsx`

```tsx
// 현재: to/href prop마다 <div className="wrapper"> 한 겹 추가
if (to) {
  return (
    <div className={wrapperClasses}> {/* ← 불필요한 래퍼 */}
      <Link href={to} className={combinedClasses}>{children}</Link>
    </div>
  );
}
```

**문제:**
- flex 컨텍스트에서 예상과 다른 nesting depth
- `w-full` 적용 시 부모 flex와 충돌 가능성
- DevTools에서 불필요한 DOM 레벨 증가

**대안: `as` prop 패턴**

```tsx
interface ButtonProps {
  as?: 'button' | 'a' | 'Link';
  href?: string;
  to?: string;
  // ...기타
}

const Button = ({ as: Tag = 'button', children, ...props }) => {
  const className = /* ... */;
  return <Tag className={className}>{children}</Tag>;
};

// 사용
<Button to="/about" />       // → <Link>
<Button href="/foo" />       // → <a>
<Button onClick={() => {}} /> // → <button>
```

---

### 2.5 Tailwind color 일관성

**현재 혼재:**
```tsx
// ✅ 브랜드 컬러
text-jeju-ocean bg-golden-sun text-coastal-gray

// ❌ Tailwind 기본값
text-gray-500 hover:bg-yellow-400 bg-gray-200
```

**위치:** `AudioPlayer.tsx`, `TrackCard.tsx` 등 일부 컴포넌트

| Tailwind 기본 | 브랜드 컬러로 교체 | 정의 위치 |
|---------------|-------------------|-----------|
| `gray-500` | `coastal-gray` (`#6B7C8A`) | `tailwind.config.js` |
| `yellow-400` | `golden-sun` hover 시 (`#FDB44B` → brighter variant 추가 권장) | 동일 |
| `gray-200` | `ocean-sand` (`#F8F9FA`) 와 가깝지만 명확한 semantic color 정의 필요 | — |

---

## 🟢 Priority 3: 중장기 개선 (리팩토링)

### 3.1 `next-i18next` 레거시 HOC 패턴

**현재:**
```tsx
// _app.tsx
export default appWithTranslation(App, nextI18NextConfig); // ← HOC 방식
```

**문제:**
- Next.js 13+ App Router와 호환 안됨
- `appWithTranslation`은 컴포넌트 HOC — Suspense, Server Components 불가

**권장:**
- Pages Router 사용 중이면 당장 문제는 없음
- **문서화**: 주석에 "App Router 마이그레이션 시 `next-intl` 또는 `createNextIntlMiddleware`로 전환 필요" 명시
- 마이그레이션 로드맵에 포함

---

### 3.2 이미지 최적화 — 정적 이미지 전수 검사

**현재 확인된 적격:**
- `HeroSection.tsx`: `next/image`, `priority`, `quality={60}` ✅

**검증 필요:**
```bash
# 정적 <img> 태그 사용 검색
rg '<img ' src/ --glob '*.tsx' | grep -v next/image
```

`public/images-webp/` 이하 이미지 중 `next/image` 미사용 항목 발견 시 전면 마이그레이션 권장:
- `sizes` 속성으로 viewport별 크기 명시
- `placeholder="blur"`로 LCP 외 이미지에 lazy loading

---

### 3.3 i18n stress postProcessor 파일 누락

**위치:** `next-i18next.config.js`

```js
const stressPostProcessor = require('./src/i18n/stressPostProcessor');
module.exports = {
  use: [stressPostProcessor], // ← 파일이 없음 (File not found)
};
```

**대안:**
1. 파일 복원 (i18n 테스트용) 또는
2. `use: []`로 정리 + 주석에 "stress testing 비활성화" 명시

---

### 3.4 ESlint `react-hooks/exhaustive-deps` 예외 다수

**위치:** 여러 페이지에서 `eslint-disable-next-line react-hooks/exhaustive-deps`

```tsx
// pages/index.tsx
const structuredData = useMemo(() => { ... }, [i18n.language]);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [i18n.language]); // ← t 함수 누락
```

**문제:** `t`가 deps에 없으면 i18n 전환 시 `structuredData` 재생성 안됨
(현재는 `useMemo` 내부에서 매번 `t()` 호출하므로 문제 없지만, lint 규칙이 이를 허용하는 구조)

**권장:**
- `eslint-disable` 주석 제거 + `t`를 deps에 추가 또는 `useTranslation()`의 안정적 참조 패턴으로 교체
- 예외가 5군데 넘으면 규칙 자체를 `warn`으로降级 고려 (현재 `error`)

---

## 📊 메트릭 요약

| 항목 | 현재 상태 | 평가 |
|------|-----------|------|
| **보안 헤더** | HSTS, X-Frame, Permissions-Policy 완성 | ✅ 우수 |
| **i18n** | 13개 언어, namespace 분리, fallback:false | ✅ 우수 |
| **SEO** | OG, Twitter Card, JSON-LD, canonicalครบ | ✅ 우수 |
| **퍼포먼스** | LazyMotion, dynamic import, font preload | ✅ 우수 |
| **접근성** | aria-label, skip-link, focus-visible, reduced-motion | ✅ 우수 |
| **에러 처리** | ErrorBoundary + custom fallback | ✅ 적절 |
| **ESLint** | 규칙 견고, console.log 제로 | ✅ 우수 |
| **타입 안전성** | strict + noImplicitAny **but** 2곳 `as unknown` | ⚠️ 개선필요 |
| **테스트 커버리지** | 10/164 파일 (~6%) | 🔴 심각 |
| **Jest 버전** | 27.x (React 18 호환성 문제) | 🔴 업그레이드 필요 |

---

## 🎯 가장 영향력 있는 3가지 개선순위

### 1. Jest → Vitest 마이그레이션 + 커버리지 50%+ 목표
- **영향**: 테스트 실행 속도 5~10배 개선, React 19 호환 보장
- **작업량**: medium | **우선도**: 🔴 최우선

### 2. `as unknown as` 타입 단언 2곳 복구 + 환경변수 zod 검증
- **영향**: 런타임 에러 방지, 빌드 시 잘못된 설정 감지
- **작업량**: small | **우선도**: 🔴 즉시

### 3. 공통 데이터 로더 통합 + 테스트 핵심 로직 우선 작성
- **영향**: 유지보수성 크게 향상, duplicate code 제거
- **작업량**: medium | **우선도**: 🟡 1~2주 내

---

## 📁 리뷰 범위

| 디렉토리 | 파일 수 | 주요 파일 |
|----------|---------|-----------|
| `src/components/` | ~60 | Navigation, HeroSection, AudioPlayer, Button, SEOHelmet 등 |
| `src/api/` | 6 | client, musicians, press, tracks, videos, gallery |
| `src/hooks/` | ~5 | useNavigation, useAudioPlayer, useCamps |
| `src/utils/` | ~10 | dataLoader, structuredData, localization, routeMatch |
| `src/types/` | 9 | camp, track, musician, video, press, gallery 등 |
| `pages/` | ~15 | _app, _document, index, album/*, camps/*, videos/* |

---

*이 문서는 2026-05-19 자동화된 코드 분석 및 수동 리뷰 기반입니다. 프로젝트 진전에 따라 주기적으로 업데이트 권장.*
