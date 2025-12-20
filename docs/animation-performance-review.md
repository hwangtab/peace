# 애니메이션 및 성능 코드리뷰

> 분석 일자: 2025-12-20
> 분석 대상: Peace & Music Camp 웹사이트
> 분석 영역: 코드 충돌, 애니메이션 중복/충돌, 성능 문제

---

## 요약 (Executive Summary)

### 주요 발견 사항

| 우선순위 | 카테고리 | 이슈 수 | 핵심 문제 |
|---------|---------|--------|----------|
| **Critical** | 애니메이션 성능 | 2 | 무한 루프 애니메이션, 대량 stagger 애니메이션 |
| **High** | 애니메이션 충돌 | 3 | framer-motion + CSS transition 충돌 |
| **High** | 코드 중복 | 3 | 애니메이션 variants 중복 정의 |
| **Medium** | Z-Index 충돌 | 4 | 모달/드롭다운 스태킹 충돌 |
| **Medium** | 성능 최적화 | 3 | 스크롤 이벤트, 리렌더링 |
| **Low** | 상태 관리 | 2 | 엣지 케이스 상태 불일치 |

---

## 1. 애니메이션 문제

### 1.1 중복 애니메이션 패턴 [High Priority]

동일한 애니메이션 variants가 여러 파일에서 중복 정의되어 있습니다.

**containerVariants 중복**:

| 파일 | 라인 | staggerChildren |
|-----|------|-----------------|
| `AboutSection.tsx` | 7-14 | 0.2s |
| `GallerySection.tsx` | 14-22 | 0.03s |
| `AlbumAboutPage.tsx` | 54-60 | 0.1s |

```typescript
// Before: src/components/home/AboutSection.tsx (lines 7-14)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

// Before: src/components/home/GallerySection.tsx (lines 14-22)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
};
```

```typescript
// After: src/constants/animations.ts (새 파일)
export const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: (stagger = 0.1) => ({
      opacity: 1,
      transition: { staggerChildren: stagger }
    })
  },
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
} as const;

export const ANIMATION_TIMING = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  stagger: {
    fast: 0.03,
    normal: 0.1,
    slow: 0.2
  }
} as const;
```

---

### 1.2 애니메이션 충돌 [High Priority]

#### 문제 1: Framer Motion + Tailwind Transition 충돌

`CampCard.tsx`에서 framer-motion과 Tailwind CSS transition이 동시에 적용되어 있습니다.

```typescript
// Before: src/components/camp/CampCard.tsx (lines 14-22)
<motion.div
  whileHover={!isComingSoon ? { y: -8 } : {}}
  transition={{ duration: 0.3 }}
  className="h-full"
>
  <Link
    className="... hover:shadow-lg transition-shadow ..."
    // framer-motion y-transform과 Tailwind shadow transition이 동시 실행
  >
```

**문제점**:
- framer-motion이 y축 transform을 제어
- Tailwind가 shadow transition을 제어
- 두 애니메이션이 다른 타이밍으로 실행되어 어색한 UX

```typescript
// After: framer-motion으로 통합
<motion.div
  whileHover={!isComingSoon ? {
    y: -8,
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
  } : {}}
  transition={{ duration: 0.3 }}
  className="h-full"
>
  <Link className="... shadow-md ...">
    // Tailwind hover:shadow-lg 제거
```

---

#### 문제 2: Inline Style이 Tailwind Transition 덮어씀

`GalleryImageItem.tsx`에서 inline style이 Tailwind의 transition 속성을 덮어씁니다.

```typescript
// Before: src/components/gallery/GalleryImageItem.tsx (lines 28-31)
<img
  className={`... transition-opacity duration-700 ease-in-out
              group-hover:scale-110 ...`}
  style={{ transitionProperty: 'opacity, transform' }}
  // inline style이 Tailwind transition-opacity를 덮어씀
  // scale-110은 transform이지만 transition-opacity만 선언됨
/>
```

**문제점**:
- `transition-opacity`는 opacity만 transition
- `group-hover:scale-110`는 transform 사용
- inline style로 둘 다 선언했지만 충돌 발생

```typescript
// After: Tailwind로 통합
<img
  className={`... transition-all duration-700 ease-in-out
              group-hover:scale-110 ...`}
  // inline style 제거, transition-all 사용
/>
```

---

### 1.3 타이밍 불일치 [Medium Priority]

#### 애니메이션 Duration 불일치

현재 코드베이스에서 사용되는 duration 값이 일관성 없이 분산되어 있습니다.

| Duration | 사용처 | 파일 |
|----------|-------|-----|
| 0.3s | whileHover | `CampCard.tsx:16` |
| 0.4s | container initial | `EventFilter.tsx:58` |
| 0.5s | filter transition | `GallerySection.tsx:102` |
| 0.6s | timeline animations | `TimelineItem.tsx:34, 43` |
| 0.8s | item animation | `AboutSection.tsx:22` |
| 1.0s | scroll indicator | `HeroSection.tsx:94` |
| 1.5s | infinite scroll | `HeroSection.tsx:103` |

**권장 표준화**:

```typescript
// src/constants/animations.ts
export const DURATION = {
  instant: 0.15,  // 매우 빠른 피드백 (버튼 탭)
  fast: 0.3,      // 빠른 전환 (hover 효과)
  normal: 0.5,    // 일반 전환 (fade in/out)
  slow: 0.8,      // 느린 전환 (섹션 등장)
  slower: 1.2,    // 매우 느린 전환 (히어로 애니메이션)
} as const;
```

#### useInView 트리거 불일치

| 파일 | 설정 | 트리거 시점 |
|-----|------|------------|
| `AboutSection.tsx:28` | `margin: "-100px"` | 요소가 뷰포트 100px 전에 |
| `MusiciansSection.tsx:16-18` | `amount: 0.1` | 요소의 10%가 보일 때 |
| `TimelineItem.tsx:88` | `margin: "-100px"` | 요소가 뷰포트 100px 전에 |

```typescript
// After: 일관된 트리거 설정
export const INVIEW_CONFIG = {
  section: { once: true, margin: "-100px" },
  item: { once: true, amount: 0.2 },
} as const;
```

---

### 1.4 성능 영향 애니메이션 [Critical]

#### 문제 1: 무한 루프 애니메이션

`HeroSection.tsx`의 스크롤 인디케이터가 무한 반복 애니메이션을 사용합니다.

```typescript
// Before: src/components/home/HeroSection.tsx (lines 98-108)
<motion.div
  animate={isScrollIndicatorInView ? {
    y: [0, 12, 0],
  } : { y: 0 }}
  transition={{
    duration: 1.5,
    repeat: isScrollIndicatorInView ? Infinity : 0,  // 무한 반복!
    repeatType: "reverse",
  }}
/>
```

**문제점**:
- 사용자가 페이지에 머무르는 동안 계속 GPU 리소스 사용
- 모바일에서 배터리 소모 증가
- 다른 애니메이션과 리소스 경쟁

```typescript
// After: 제한된 반복 + 지연 후 정지
<motion.div
  animate={isScrollIndicatorInView ? {
    y: [0, 12, 0],
  } : { y: 0 }}
  transition={{
    duration: 1.5,
    repeat: 3,  // 3번만 반복
    repeatType: "reverse",
    repeatDelay: 0.5,
  }}
/>
```

---

#### 문제 2: 대량 Stagger 애니메이션

`GallerySection.tsx`에서 수백 개의 이미지에 stagger 애니메이션을 적용합니다.

```typescript
// Before: src/components/home/GallerySection.tsx
const containerVariants = {
  visible: {
    transition: { staggerChildren: 0.03 }  // 100개 이미지 = 3초 지연
  }
};

// 100개 이상의 이미지가 동시에 애니메이션
{displayImages.map((image, index) => (
  <motion.div variants={itemVariants}>
    <GalleryImageItem ... />
  </motion.div>
))}
```

**문제점**:
- 100개 이미지 × 0.03s = 마지막 이미지는 3초 후 애니메이션
- 모든 이미지가 GPU 메모리에 애니메이션 상태 유지
- 스크롤 시 jank 발생 가능

```typescript
// After: 뷰포트 내 이미지만 애니메이션
{displayImages.map((image, index) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.3 }}
  >
    <GalleryImageItem ... />
  </motion.div>
))}
```

---

## 2. 성능 문제

### 2.1 불필요한 리렌더링 [Medium Priority]

#### 문제 1: 함수/객체 매 렌더마다 재생성

```typescript
// Before: src/components/home/HeroSection.tsx (lines 19-26)
const HeroSection = ({ imageUrl }: HeroSectionProps) => {
  // 매 렌더마다 새로운 함수 생성
  const getResponsiveImagePath = (imagePath: string) => {
    const basePath = imagePath.replace('.webp', '');
    return {
      mobile: `${basePath}-mobile.webp`,
      tablet: `${basePath}-tablet.webp`,
      desktop: `${basePath}-desktop.webp`,
      original: imagePath
    };
  };

  // 매 렌더마다 새로운 객체 생성
  const responsiveImages = getResponsiveImagePath(imageUrl);
```

```typescript
// After: 컴포넌트 외부로 이동 또는 useMemo 사용
const getResponsiveImagePath = (imagePath: string) => {
  const basePath = imagePath.replace('.webp', '');
  return {
    mobile: `${basePath}-mobile.webp`,
    tablet: `${basePath}-tablet.webp`,
    desktop: `${basePath}-desktop.webp`,
    original: imagePath
  };
};

const HeroSection = ({ imageUrl }: HeroSectionProps) => {
  const responsiveImages = useMemo(
    () => getResponsiveImagePath(imageUrl),
    [imageUrl]
  );
```

---

#### 문제 2: Button motionProps 재생성

```typescript
// Before: src/components/common/Button.tsx (lines 65-68)
const Button = ({ disabled, ... }) => {
  // 매 렌더마다 새로운 객체 생성
  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.05 },
    whileTap: disabled ? {} : { scale: 0.95 },
  };
```

```typescript
// After: useMemo 사용
const Button = ({ disabled, ... }) => {
  const motionProps = useMemo(() => ({
    whileHover: disabled ? {} : { scale: 1.05 },
    whileTap: disabled ? {} : { scale: 0.95 },
  }), [disabled]);
```

---

### 2.2 스크롤 이벤트 최적화 [Medium Priority]

`useNavigation.ts`에서 스크롤 이벤트가 throttling 없이 처리됩니다.

```typescript
// Before: src/hooks/useNavigation.ts (lines 12-22)
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);  // 매 스크롤마다 상태 업데이트 (~60fps)
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

**문제점**:
- 스크롤 시 초당 60회 상태 업데이트
- Navigation 컴포넌트 리렌더링 유발
- 모바일에서 성능 저하

```typescript
// After: throttle 적용
import { useCallback, useEffect, useRef } from 'react';

useEffect(() => {
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 0);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

### 2.3 번들 크기 [Low Priority]

#### Instagram SVG 아이콘 중복

동일한 Instagram SVG 경로가 여러 파일에서 중복됩니다.

| 파일 | 라인 |
|-----|------|
| `MusicianCard.tsx` | 82-84 |
| `MusicianModal.tsx` | 117-119 |

```typescript
// After: 공통 아이콘 컴포넌트 생성
// src/components/icons/InstagramIcon.tsx
export const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07..." />
  </svg>
);
```

---

## 3. 코드 충돌

### 3.1 Z-Index 스태킹 충돌 [Medium Priority]

현재 여러 컴포넌트가 동일한 z-index 값을 사용합니다.

| 컴포넌트 | z-index | 파일:라인 |
|---------|---------|----------|
| Navigation | z-50 | `Navigation.tsx:22` |
| NavigationDropdown | z-50 | `NavigationDropdown.tsx:108` |
| ImageLightbox | z-50 | `ImageLightbox.tsx:21` |
| MusicianModal | z-50 | `MusicianModal.tsx:15` |
| HeroSection content | z-10 | `HeroSection.tsx:56` |

**문제점**:
- 모달과 네비게이션 드롭다운이 동시에 열릴 경우 스태킹 순서 예측 불가
- DOM 순서에 따라 결정되어 불안정

```typescript
// After: Z-Index 계층 정의
// src/constants/zIndex.ts
export const Z_INDEX = {
  base: 0,
  dropdown: 40,
  sticky: 50,
  modal: 60,
  tooltip: 70,
  notification: 80,
} as const;

// Navigation.tsx
className={`... z-[${Z_INDEX.sticky}]`}

// ImageLightbox.tsx
className={`... z-[${Z_INDEX.modal}]`}
```

---

### 3.2 CSS/JS 애니메이션 충돌 [Medium Priority]

#### TimelineItem 이중 애니메이션

모바일에서 MobileCard와 부모 컨테이너가 동시에 애니메이션됩니다.

```typescript
// Before: src/components/timeline/TimelineItem.tsx
// 부모 컨테이너 (line 128)
<motion.div variants={containerVariants}>

  // MobileCard (line 84-88)
  <motion.div variants={mobileContentVariants}>
    // delay: 0.2가 중첩되어 이중 지연
```

**문제점**:
- containerVariants와 mobileContentVariants 모두 애니메이션 적용
- 결과적으로 두 번 fade-in 효과 발생

```typescript
// After: 부모 또는 자식 중 하나만 애니메이션
<motion.div>  {/* 부모는 wrapper만 */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    {/* MobileCard 내용 */}
  </motion.div>
</motion.div>
```

---

### 3.3 상태 관리 이슈 [Low Priority]

#### useNavigation 드롭다운 상태 불일치

```typescript
// Before: src/hooks/useNavigation.ts (lines 24-29)
const toggleMenu = useCallback(() => {
  setIsMobileMenuOpen(prev => !prev);
  setMobileOpenDropdown(null);  // 메뉴 토글 시 드롭다운 초기화
}, []);

// 하지만 closeMenu에서는 드롭다운 초기화 안함
const closeMenu = useCallback(() => {
  setIsMobileMenuOpen(false);
  // setMobileOpenDropdown(null) 누락
}, []);
```

```typescript
// After: 일관된 상태 초기화
const closeMenu = useCallback(() => {
  setIsMobileMenuOpen(false);
  setMobileOpenDropdown(null);  // 드롭다운도 초기화
}, []);
```

---

#### PageHero 이미지 무한 재시도

```typescript
// Before: src/components/common/PageHero.tsx (lines 52-59)
onError={(e) => {
  const img = e.target as HTMLImageElement;
  if (img.src.includes('-desktop')) {
    img.src = imageUrl;  // 원본으로 대체
    // 원본도 실패하면 다시 -desktop 시도 → 무한 루프!
  }
}}
```

```typescript
// After: 실패 플래그 추가
const [imageFailed, setImageFailed] = useState(false);

onError={(e) => {
  if (imageFailed) return;  // 이미 실패한 경우 무시

  const img = e.target as HTMLImageElement;
  if (img.src.includes('-desktop')) {
    img.src = imageUrl;
    setImageFailed(true);
  }
}}
```

---

## 우선순위별 액션 아이템

### Critical (즉시 수정)
- [ ] `HeroSection.tsx`: 무한 루프 애니메이션을 3회 반복으로 제한
- [ ] `GallerySection.tsx`: stagger 애니메이션을 whileInView로 변경

### High (1주 내)
- [ ] 애니메이션 variants를 `constants/animations.ts`로 중앙화
- [ ] `CampCard.tsx`: framer-motion + Tailwind transition 충돌 해결
- [ ] `GalleryImageItem.tsx`: inline style 제거, transition-all 사용

### Medium (2주 내)
- [ ] Z-Index 계층 구조 정의 및 적용 (`constants/zIndex.ts`)
- [ ] `useNavigation.ts`: 스크롤 이벤트 throttling 적용
- [ ] `HeroSection.tsx`: getResponsiveImagePath useMemo 적용
- [ ] `TimelineItem.tsx`: 모바일 이중 애니메이션 제거
- [ ] 애니메이션 타이밍 표준화 (`DURATION`, `EASING` 상수)

### Low (1달 내)
- [ ] Instagram SVG 아이콘 공통 컴포넌트로 추출
- [ ] `useNavigation.ts`: closeMenu에서 드롭다운 상태 초기화
- [ ] `PageHero.tsx`: 이미지 에러 무한 재시도 방지
- [ ] useInView 트리거 설정 표준화

---

## 참고 자료

- [Framer Motion Performance](https://www.framer.com/motion/guide-reduce-bundle-size/)
- [CSS vs JS Animations](https://web.dev/animations-guide/)
- [React Performance Optimization](https://react.dev/reference/react/useMemo)
- [Z-Index Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
