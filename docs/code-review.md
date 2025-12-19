# Peace & Music 코드베이스 코드리뷰

> 분석 일자: 2025-12-20
> 분석 대상: Peace & Music Camp 웹사이트
> 코드베이스 규모: 68개 TSX 컴포넌트, 약 6,125줄

## 기술 스택

- **프레임워크**: React 18.2 + TypeScript 4.9
- **스타일링**: Tailwind CSS 3.4
- **애니메이션**: Framer Motion 12.4
- **라우팅**: React Router DOM 6.14
- **오디오**: Howler.js + Wavesurfer.js
- **배포**: GitHub Pages (peaceandmusic.net)

---

## 요약 (Executive Summary)

### 주요 강점
- 잘 구성된 컴포넌트 디렉토리 구조
- Tailwind CSS를 활용한 일관된 디자인 시스템
- React.lazy를 활용한 라우트 레벨 코드 스플리팅
- 적절한 ErrorBoundary 구현
- SEO를 위한 React Helmet 및 구조화 데이터 유틸리티 준비

### 핵심 개선 필요 영역
| 우선순위 | 영역 | 핵심 이슈 |
|---------|------|----------|
| High | 타입 안전성 | `as any` 타입 단언 사용 |
| High | 코드 중복 | Camp 페이지 95% 중복, fetch 로직 중복 |
| Medium | 접근성 | generic alt 텍스트, ARIA 상태 미흡 |
| Medium | 하드코딩 | 페이지네이션 크기, 연도 등 매직 넘버 |
| Low | 성능 | 정적 데이터 재생성, React.memo 미적용 |

---

## 상세 개선점

### 1. 코드 품질

#### 1.1 코드 중복 [High Priority]

**문제 1: Camp 페이지 중복**

`Camp2023Page.tsx`와 `Camp2025Page.tsx`가 95% 동일한 구조입니다.

```typescript
// Before: src/pages/Camp2023Page.tsx (lines 11-62)
const Camp2023Page = () => {
  const camp = camps.find(c => c.id === 'camp-2023')!;
  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: "-100px" });
  return (
    <PageLayout
      title="제1회 강정피스앤뮤직캠프 (2023)..."
      // ... 50+ lines of identical structure
    >
      ...
    </PageLayout>
  );
};

// Before: src/pages/Camp2025Page.tsx (lines 11-62)
const Camp2025Page = () => {
  const camp = camps.find(c => c.id === 'camp-2025')!;
  // ... 동일한 구조 반복
};
```

```typescript
// After: 재사용 가능한 CampDetailPage 컴포넌트 생성
// src/pages/CampDetailPage.tsx
interface CampDetailPageProps {
  campId: string;
}

const CampDetailPage: React.FC<CampDetailPageProps> = ({ campId }) => {
  const camp = camps.find(c => c.id === campId);

  if (!camp) {
    return <NotFound />;
  }

  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: "-100px" });

  return (
    <PageLayout
      title={`제${camp.order}회 강정피스앤뮤직캠프 (${camp.year})`}
      description={camp.shortDescription}
      // ...
    >
      <CampHero camp={camp} />
      <CampInfoSection camp={camp} ref={infoRef} inView={isInfoInView} />
      <CampGallery camp={camp} />
    </PageLayout>
  );
};

// src/pages/Camp2023Page.tsx
const Camp2023Page = () => <CampDetailPage campId="camp-2023" />;

// src/pages/Camp2025Page.tsx
const Camp2025Page = () => <CampDetailPage campId="camp-2025" />;
```

**문제 2: Gallery fetch 로직 중복**

`api/gallery.ts`와 `GallerySection.tsx`에서 동일한 fetch 로직이 구현되어 있습니다.

```typescript
// Before: src/components/home/GallerySection.tsx (lines 54-74)
const loadImages = async () => {
  const categories = ['album', 'camp2023', 'camp2025'];
  const responses = await Promise.all(
    categories.map(cat =>
      fetch(`/data/gallery/${cat}.json`)
        .then(res => res.json())
        .catch(() => [])
    )
  );
  // ...
};

// Before: src/api/gallery.ts (lines 8-29)
// 거의 동일한 로직 구현
```

```typescript
// After: API 모듈만 사용
// src/components/home/GallerySection.tsx
import { getGalleryImages } from '../../api/gallery';

useEffect(() => {
  let isCancelled = false;

  getGalleryImages().then(images => {
    if (!isCancelled) {
      const sorted = images.sort((a, b) =>
        (a.eventYear || 0) - (b.eventYear || 0) || a.id - b.id
      );
      setImages(sorted);
    }
  });

  return () => { isCancelled = true; };
}, []);
```

---

#### 1.2 타입 안전성 [High Priority]

**문제: `as any` 타입 단언**

`Button.tsx`에서 onClick 핸들러에 `as any` 사용

```typescript
// Before: src/components/common/Button.tsx (lines 78, 96, 109)
<Link
  to={to}
  className={combinedClasses}
  onClick={onClick as any}  // 타입 안전성 우회
>
  {content}
</Link>
```

```typescript
// After: 정확한 타입 정의
interface ButtonProps {
  // onClick을 더 유연한 타입으로 정의
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

// Link 컴포넌트용 별도 핸들러
<Link
  to={to}
  className={combinedClasses}
  onClick={(e) => onClick?.(e as React.MouseEvent<HTMLElement>)}
>
  {content}
</Link>
```

**문제: Non-null assertion 사용**

```typescript
// Before: src/pages/Camp2023Page.tsx (line 12)
const camp = camps.find(c => c.id === 'camp-2023')!;

// After: 안전한 처리
const camp = camps.find(c => c.id === 'camp-2023');
if (!camp) {
  return <NotFoundPage />;
}
```

---

#### 1.3 하드코딩된 값 [Medium Priority]

**문제: 매직 넘버**

```typescript
// Before: src/components/home/GallerySection.tsx
const [visibleCount, setVisibleCount] = useState<number>(12);
// ...
setVisibleCount(prev => prev + 12);

// Before: src/components/layout/Footer.tsx (line 138)
© 2026 강정피스앤뮤직캠프. All rights reserved.
```

```typescript
// After: 상수 추출
// src/constants/config.ts
export const GALLERY_CONFIG = {
  INITIAL_VISIBLE_COUNT: 12,
  LOAD_MORE_COUNT: 12,
} as const;

export const SITE_CONFIG = {
  COPYRIGHT_YEAR: new Date().getFullYear(),
  SITE_NAME: '강정피스앤뮤직캠프',
} as const;

// 사용
const [visibleCount, setVisibleCount] = useState(GALLERY_CONFIG.INITIAL_VISIBLE_COUNT);
setVisibleCount(prev => prev + GALLERY_CONFIG.LOAD_MORE_COUNT);
```

---

### 2. 아키텍처

#### 2.1 컴포넌트 구조 [Good]

현재 구조는 잘 조직되어 있습니다:
```
/components
  /layout   - 레이아웃 관련 (Navigation, Footer, Section)
  /home     - 홈페이지 섹션들
  /camp     - 캠프 관련 컴포넌트
  /common   - 재사용 컴포넌트 (Button, EventFilter)
  /shared   - 공유 유틸리티 (SEOHelmet)
```

**권장 개선**: `common`과 `shared` 폴더를 하나로 통합

---

#### 2.2 상태 관리 [Good]

- Redux 없이 적절한 useState/useEffect 사용
- 커스텀 훅으로 로직 분리 (useAudioPlayer, useNavigation)

---

#### 2.3 에러 처리 [Medium Priority]

**문제: 사용자에게 에러 상태 미표시**

```typescript
// Before: src/api/gallery.ts (lines 24-27)
} catch (fetchError) {
  console.error(`Fetch error for ${cat}:`, fetchError);
  return [];  // 빈 배열 반환, 사용자에게 알림 없음
}
```

```typescript
// After: 에러 상태 반환
interface GalleryResult {
  images: GalleryImage[];
  error: string | null;
  hasPartialError: boolean;
}

export const getGalleryImages = async (): Promise<GalleryResult> => {
  const errors: string[] = [];
  // ...
  return {
    images: results.flat(),
    error: errors.length > 0 ? errors.join(', ') : null,
    hasPartialError: errors.length > 0 && errors.length < categories.length,
  };
};
```

---

### 3. 성능

#### 3.1 렌더링 최적화 [Low Priority]

**문제: 정적 데이터가 컴포넌트 내부에서 재생성**

```typescript
// Before: src/components/layout/Footer.tsx (lines 7-39)
const Footer = () => {
  // 매 렌더마다 재생성됨
  const footerMenuItems = [
    { name: '홈', path: ROUTES.HOME },
    // ...
  ];
  const campMenuItems = [...];
  const albumMenuItems = [...];
  const socialLinks = [...];
};
```

```typescript
// After: 컴포넌트 외부로 이동
const FOOTER_MENU_ITEMS = [
  { name: '홈', path: ROUTES.HOME },
  // ...
] as const;

const CAMP_MENU_ITEMS = [...] as const;
const ALBUM_MENU_ITEMS = [...] as const;
const SOCIAL_LINKS = [...] as const;

const Footer = () => {
  // 이제 매번 재생성되지 않음
};
```

**문제: React.memo 미적용**

```typescript
// Before: src/components/camp/CampCard.tsx
const CampCard = ({ camp }: CampCardProps) => { ... };
export default CampCard;

// After: 메모이제이션 적용
const CampCard = React.memo(({ camp }: CampCardProps) => { ... });
export default CampCard;
```

---

#### 3.2 이미지 최적화 [Good]

- WebP 포맷 사용 중
- lazy loading 구현됨 (`loading="lazy"`)
- srcSet으로 반응형 이미지 제공

---

### 4. 접근성 (A11y)

#### 4.1 이미지 Alt 텍스트 [Medium Priority]

**문제: Generic alt 텍스트**

```typescript
// Before: src/components/home/GallerySection.tsx (line 185)
alt: selectedImage.description || `Gallery image ${selectedImage.id}`

// Before: src/components/home/HeroSection.tsx (line 42)
alt="Hero background"
```

```typescript
// After: 설명적인 alt 텍스트
// GallerySection.tsx
alt: selectedImage.description ||
     `${selectedImage.eventYear}년 캠프 갤러리 이미지`

// HeroSection.tsx
alt="강정마을 해변에서 열린 피스앤뮤직캠프 무대"
```

---

#### 4.2 ARIA 상태 [Medium Priority]

**문제: 필터 버튼에 선택 상태 미표시**

```typescript
// Before: EventFilter 컴포넌트
<button onClick={() => onFilterChange('all')}>전체</button>

// After: aria-pressed 추가
<button
  onClick={() => onFilterChange('all')}
  aria-pressed={selectedFilter === 'all'}
  role="switch"
>
  전체
</button>
```

---

#### 4.3 포커스 관리 [Medium Priority]

**문제: 모달 열림 시 포커스 트랩 없음**

```typescript
// After: ImageLightbox에 포커스 트랩 추가
// @headlessui/react의 Dialog 사용 권장
import { Dialog } from '@headlessui/react';

const ImageLightbox = ({ image, onClose }) => (
  <Dialog open={true} onClose={onClose}>
    <Dialog.Panel>
      {/* 포커스가 자동으로 트랩됨 */}
    </Dialog.Panel>
  </Dialog>
);
```

---

### 5. SEO

#### 5.1 메타 태그 [Good]

React Helmet으로 적절히 구현됨

---

#### 5.2 구조화 데이터 [Medium Priority]

**문제: 정의된 스키마 미사용**

`structuredData.ts`에 18개 스키마 생성 함수가 있으나 대부분 미사용

```typescript
// 현재 정의됨 (utils/structuredData.ts)
- getOrganizationSchema()
- getWebSiteSchema()
- getMusicGroupSchema()
- getBreadcrumbSchema()
- getMusicAlbumSchema()
// ... 등

// 권장: 각 페이지에 적절한 스키마 적용
// AlbumAboutPage.tsx
<SEOHelmet
  structuredData={[
    getMusicAlbumSchema(albumData),
    getBreadcrumbSchema(['홈', '앨범', '앨범 소개'])
  ]}
/>
```

---

### 6. 보안

#### 6.1 외부 링크 처리 [Good]

```typescript
// Footer.tsx - 올바르게 구현됨
rel={link.name === 'Instagram' ? 'noopener noreferrer' : undefined}
```

---

#### 6.2 의존성 관리 [Low Priority]

- 정기적인 `npm audit` 실행 권장
- CI/CD에 의존성 검사 추가 권장

---

### 7. 테스트

#### 7.1 현재 커버리지

| 항목 | 현황 |
|-----|------|
| 총 컴포넌트 | 68개 |
| 테스트 파일 | 5개 |
| 커버리지 | 약 7% |

---

#### 7.2 권장 테스트 추가

우선순위별 테스트 추가 대상:

1. **Critical**: 라우팅 테스트 (App.tsx)
2. **High**: 오디오 플레이어 (AudioPlayer, useAudioPlayer)
3. **High**: 갤러리 필터링 (EventFilter, GallerySection)
4. **Medium**: 캠프 페이지 렌더링
5. **Medium**: SEO 메타 태그 생성

---

## 우선순위별 액션 아이템

### Critical (즉시)
- [ ] `Button.tsx`의 `as any` 제거 및 타입 수정

### High (1주 내)
- [ ] Camp 페이지 중복 코드 리팩토링 (CampDetailPage 생성)
- [ ] Gallery fetch 로직을 api/gallery.ts로 통합
- [ ] Non-null assertion (`!`) 제거 및 안전한 처리 추가

### Medium (2주 내)
- [ ] 하드코딩된 값을 constants로 추출
- [ ] 이미지 alt 텍스트 개선
- [ ] EventFilter에 aria-pressed 추가
- [ ] 구조화 데이터 스키마 페이지별 적용

### Low (1달 내)
- [ ] Footer 정적 데이터 컴포넌트 외부로 이동
- [ ] CampCard, VideoCard에 React.memo 적용
- [ ] 테스트 커버리지 30% 목표로 확대
- [ ] npm audit를 CI/CD에 추가

---

## 참고 자료

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Schema.org Structured Data](https://schema.org/)
