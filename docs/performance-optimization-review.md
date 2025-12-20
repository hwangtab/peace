# 성능 최적화 코드리뷰

> 분석 일자: 2025-12-20
> 분석 대상: Peace & Music Camp 웹사이트
> 분석 영역: 렌더링 성능, 에셋 최적화, 번들 크기, 런타임 성능, Core Web Vitals

---

## 요약 (Executive Summary)

### 성능 현황 개요

| 카테고리 | 상태 | 주요 이슈 |
|---------|------|----------|
| **에셋 크기** | Critical | 오디오 127MB, 이미지 528MB |
| **렌더링 성능** | Medium | React.memo 4개 컴포넌트 누락 |
| **코드 스플리팅** | Good | 라우트 기반 lazy loading 적용됨 |
| **런타임 성능** | Good | 스크롤 이벤트 rAF 최적화됨 |
| **리소스 관리** | Good | 오디오 cleanup 잘 구현됨 |

### 예상 개선 효과

| 최적화 항목 | 예상 개선 |
|------------|----------|
| 이미지 압축 (2-4MB → 200KB) | LCP 3-5초 개선 |
| 오디오 스트리밍 | 초기 로드 127MB 감소 |
| preload 적용 | FCP 0.5-1초 개선 |
| React.memo 적용 | 리렌더링 30-50% 감소 |

---

## 1. 렌더링 성능

### 1.1 React.memo 적용 필요 [High Priority]

다음 컴포넌트들은 자주 리렌더링되지만 React.memo가 적용되지 않았습니다.

#### MusiciansSection

```typescript
// Before: src/components/home/MusiciansSection.tsx
const MusiciansSection = ({ ... }) => {
  // 부모가 리렌더링될 때마다 전체 섹션 리렌더링
  return (
    <Section>
      {musicians.map((musician) => (
        <MusicianCard key={musician.id} musician={musician} />
      ))}
    </Section>
  );
};

export default MusiciansSection;
```

```typescript
// After: React.memo 적용
const MusiciansSection = React.memo(({ ... }) => {
  return (
    <Section>
      {musicians.map((musician) => (
        <MusicianCard key={musician.id} musician={musician} />
      ))}
    </Section>
  );
});

MusiciansSection.displayName = 'MusiciansSection';
export default MusiciansSection;
```

#### 네비게이션 컴포넌트

| 컴포넌트 | 파일 | 문제점 |
|---------|-----|--------|
| `DesktopMenu` | `DesktopMenu.tsx:15-82` | 스크롤 시 매번 리렌더링 |
| `MobileMenu` | `MobileMenu.tsx:14-71` | 조건부 렌더링 시 비용 발생 |
| `MusicianModal` | `MusicianModal.tsx:13-137` | isOpen 외 props 변경에도 리렌더링 |

```typescript
// After: 네비게이션 컴포넌트 메모화
const DesktopMenu = React.memo(({ location, desktopOpenDropdown, ... }) => {
  // ...
});

DesktopMenu.displayName = 'DesktopMenu';
```

---

### 1.2 useCallback/useMemo 최적화 [Medium Priority]

#### 인라인 핸들러 함수 재생성

```typescript
// Before: src/components/home/TracksSection.tsx (lines 48-50)
{tracks.map((track) => (
  <TrackCard
    onToggle={() => handleToggle(track.id)}  // 매 렌더마다 새 함수 생성
    onPlay={() => handlePlay(track.id)}       // 매 렌더마다 새 함수 생성
  />
))}
```

```typescript
// After: useCallback으로 래핑된 핸들러 직접 전달
const TrackCardWithHandlers = React.memo(({ track, handleToggle, handlePlay }) => {
  const onToggle = useCallback(() => handleToggle(track.id), [track.id, handleToggle]);
  const onPlay = useCallback(() => handlePlay(track.id), [track.id, handlePlay]);

  return <TrackCard onToggle={onToggle} onPlay={onPlay} />;
});

// 또는 track.id를 prop으로 전달하고 자식에서 처리
<TrackCard
  trackId={track.id}
  onToggle={handleToggle}  // 안정적인 참조
  onPlay={handlePlay}
/>
```

#### NavigationDropdown onClick 인라인

```typescript
// Before: src/components/layout/NavigationDropdown.tsx (lines 87, 119)
<button onClick={() => setOpen(!open)}>  {/* 매 렌더마다 새 함수 */}
<Link onClick={() => setOpen(false)}>    {/* 각 Link마다 새 함수 */}
```

```typescript
// After: useCallback 사용
const toggleOpen = useCallback(() => setOpen(prev => !prev), []);
const closeDropdown = useCallback(() => setOpen(false), []);

<button onClick={toggleOpen}>
<Link onClick={closeDropdown}>
```

---

#### useMemo 누락된 계산

```typescript
// Before: src/components/layout/NavigationDropdown.tsx (lines 59-70)
// 매 렌더마다 isActive 계산 실행
const isActive = items.some(item =>
  location.pathname === item.path ||
  location.pathname.startsWith(item.path.split('/').slice(0, -1).join('/') + '/')
);
```

```typescript
// After: useMemo로 메모화
const isActive = useMemo(() =>
  items.some(item =>
    location.pathname === item.path ||
    location.pathname.startsWith(item.path.split('/').slice(0, -1).join('/') + '/')
  ),
  [items, location.pathname]
);
```

---

### 1.3 불필요한 리렌더링 [Medium Priority]

#### 연속 상태 업데이트

```typescript
// Before: src/components/home/GallerySection.tsx
// 필터 변경 시 2번의 연속 상태 업데이트
useEffect(() => {
  setVisibleCount(GALLERY_CONFIG.INITIAL_VISIBLE_COUNT);
}, [selectedFilter]);  // 필터 변경 → visibleCount 변경 → 2번 리렌더링
```

```typescript
// After: 상태 통합 또는 배치 처리
// React 18에서는 자동 배치되지만, 명시적으로 통합 가능
const [galleryState, setGalleryState] = useState({
  selectedFilter: 'all',
  visibleCount: GALLERY_CONFIG.INITIAL_VISIBLE_COUNT
});

const changeFilter = useCallback((filter: string) => {
  setGalleryState({
    selectedFilter: filter,
    visibleCount: GALLERY_CONFIG.INITIAL_VISIBLE_COUNT
  });
}, []);
```

---

## 2. 에셋 최적화

### 2.1 이미지 최적화 [Critical]

#### 현재 상태

| 폴더 | 크기 | 파일 수 | 평균 파일 크기 |
|-----|------|--------|--------------|
| `images-webp/camps` | 528MB | 895개 | 590KB |
| `images-webp/gallery` | 20MB | 1,087개 | 18KB |
| `images-webp/album` | 728KB | 12개 | 61KB |

**문제점**: 캠프 이미지 중 다수가 2-4MB로 과대

| 예시 파일 | 크기 |
|----------|------|
| `peacemusic-1.webp` | 4.4MB |
| `peacemusic-2.webp` | 4.3MB |
| 다수의 캠프 사진 | 2MB+ |

#### 권장 최적화

```bash
# 이미지 리사이징 및 압축 스크립트
# scripts/optimize-images.js

const SIZES = {
  thumbnail: { width: 400, quality: 75 },   // 리스트용
  medium: { width: 800, quality: 80 },      // 상세페이지
  large: { width: 1920, quality: 85 },      // 히어로/전체화면
};

// 권장 최대 크기
// - 썸네일: 50KB 이하
// - 중간: 200KB 이하
// - 대형: 500KB 이하
```

#### 반응형 이미지 구현

```typescript
// After: picture 요소로 포맷 폴백 + 반응형
<picture>
  <source
    type="image/avif"
    srcSet={`
      ${image}-400.avif 400w,
      ${image}-800.avif 800w,
      ${image}-1200.avif 1200w
    `}
  />
  <source
    type="image/webp"
    srcSet={`
      ${image}-400.webp 400w,
      ${image}-800.webp 800w,
      ${image}-1200.webp 1200w
    `}
  />
  <img
    src={`${image}-800.jpg`}
    alt={description}
    loading="lazy"
    decoding="async"
    width={800}
    height={600}
  />
</picture>
```

---

### 2.2 오디오 최적화 [Critical]

#### 현재 상태

| 항목 | 값 |
|-----|---|
| 총 크기 | 127MB |
| 파일 수 | 26개 MP3 |
| 최대 파일 | 16MB (4.mp3) |
| 평균 크기 | ~5MB |

#### 권장 최적화

**1. 포맷 변환**

```bash
# MP3 → Opus 변환 (50-70% 크기 감소)
ffmpeg -i input.mp3 -c:a libopus -b:a 96k output.opus

# 또는 AAC (호환성 우선)
ffmpeg -i input.mp3 -c:a aac -b:a 128k output.m4a
```

**2. 스트리밍 구현**

```typescript
// Before: 전체 파일 다운로드
const sound = new Howl({
  src: ['/audio/1.mp3'],  // 전체 파일 로드
});

// After: 스트리밍 + 청크 로딩
const sound = new Howl({
  src: ['/audio/1.mp3'],
  html5: true,  // HTML5 Audio 사용 (스트리밍 지원)
  preload: 'metadata',  // 메타데이터만 먼저 로드
});
```

**3. 품질 선택**

```typescript
// 네트워크 상태에 따른 품질 선택
const getAudioQuality = () => {
  const connection = (navigator as any).connection;
  if (connection?.effectiveType === '4g') return 'high';  // 192kbps
  if (connection?.effectiveType === '3g') return 'medium'; // 128kbps
  return 'low';  // 64kbps
};
```

---

### 2.3 Critical Resources [High Priority]

#### 현재 상태: preload 없음

`public/index.html`에 리소스 힌트가 없습니다.

#### 권장 추가

```html
<!-- public/index.html <head> 섹션 -->

<!-- 1. 폰트 프리로드 (FOUT/FOIT 방지) -->
<link
  rel="preload"
  href="/fonts/GMarketSans/GMarketSansTTFMedium.ttf"
  as="font"
  type="font/ttf"
  crossorigin
/>
<link
  rel="preload"
  href="/fonts/BookkMyungjo/BookkMyungjo-Bd.ttf"
  as="font"
  type="font/ttf"
  crossorigin
/>

<!-- 2. 히어로 이미지 프리로드 -->
<link
  rel="preload"
  href="/images-webp/hero/main-desktop.webp"
  as="image"
  type="image/webp"
  fetchpriority="high"
/>

<!-- 3. DNS Prefetch (외부 리소스) -->
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
<link rel="dns-prefetch" href="//www.youtube.com" />
<link rel="dns-prefetch" href="//img.youtube.com" />

<!-- 4. Preconnect (자주 사용하는 외부 도메인) -->
<link rel="preconnect" href="https://www.instagram.com" />
```

---

## 3. 번들 크기

### 3.1 코드 스플리팅 [Good - 이미 적용됨]

`App.tsx`에서 라우트 기반 코드 스플리팅이 적절히 구현되어 있습니다.

```typescript
// 현재 구현 (좋음)
const PressPage = lazy(() => import('./components/press/PressPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const VideoPage = lazy(() => import('./components/videos/VideoPage'));
const Camp2023Page = lazy(() => import('./pages/Camp2023Page'));
// ... 등
```

---

### 3.2 의존성 최적화 [Medium Priority]

#### 현재 주요 의존성

| 패키지 | 크기 (gzip) | 사용 빈도 | 권장 |
|--------|------------|----------|------|
| `framer-motion` | ~65KB | 27개 파일 | 유지 (핵심 기능) |
| `howler` | ~20KB | 1개 훅 | Web Audio API 검토 |
| `react-router-dom` | ~40KB | 필수 | 유지 |
| `core-js-pure` | ~50KB | 폴리필 | 모던 브라우저만 지원 시 제거 |

#### 제거 검토 대상

```json
// package.json 검토 필요
{
  "dependencies": {
    "wavesurfer.js": "^7.8.9",  // 타입 정의만 사용? 확인 필요
    "open-graph-scraper": "...", // 서버사이드용, 프론트엔드 번들에서 제외
    "ajv": "...",                // 사용 여부 확인
    "ajv-keywords": "..."        // 사용 여부 확인
  }
}
```

---

### 3.3 Tree Shaking [Low Priority]

#### Framer Motion 최적화

```typescript
// Before: 전체 import
import { motion, AnimatePresence, useInView } from 'framer-motion';

// After: 필요한 것만 import (번들러가 tree-shake)
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
```

#### 번들 분석 도구 추가

```json
// package.json scripts
{
  "scripts": {
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  },
  "devDependencies": {
    "source-map-explorer": "^2.5.3"
  }
}
```

---

## 4. 런타임 성능

### 4.1 이벤트 리스너 [Medium Priority]

#### NavigationDropdown 의존성 불안정

```typescript
// Before: src/components/layout/NavigationDropdown.tsx (line 57)
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  if (open) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [open, setOpen]);  // setOpen이 변경될 때마다 리스너 재등록
```

```typescript
// After: useRef로 안정화
const setOpenRef = useRef(setOpen);
setOpenRef.current = setOpen;

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenRef.current(false);
    }
  };

  if (open) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [open]);  // setOpen 의존성 제거
```

---

### 4.2 메모리 관리 [Good - 잘 구현됨]

#### 오디오 리소스 관리 (좋은 예시)

```typescript
// src/hooks/useAudioPlayer.ts - 우수한 구현
useEffect(() => {
  const sound = new Howl({ src: [audioUrl] });
  soundRef.current = sound;

  return () => {
    if (soundRef.current) {
      soundRef.current.unload();  // 메모리 해제
      soundRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);  // 애니메이션 프레임 정리
      requestRef.current = null;
    }
  };
}, [audioUrl]);
```

#### 비동기 작업 취소 (좋은 예시)

```typescript
// src/components/home/GallerySection.tsx - 우수한 구현
useEffect(() => {
  let isCancelled = false;

  const loadImages = async () => {
    const images = await getGalleryImages();
    if (isCancelled) return;  // 언마운트 시 상태 업데이트 방지
    setImages(images);
  };

  loadImages();
  return () => { isCancelled = true; };
}, []);
```

---

### 4.3 데이터 처리 [Low Priority]

#### Date 객체 반복 생성

```typescript
// Before: src/utils/sorting.ts (line 11)
export const sortByDateDesc = <T extends DateItem>(items: T[]): T[] => {
  return [...items].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
    // 비교마다 새 Date 객체 생성 (O(n log n) 객체 생성)
  );
};
```

```typescript
// After: 날짜 캐싱
export const sortByDateDesc = <T extends DateItem>(items: T[]): T[] => {
  // 한 번만 Date 파싱
  const itemsWithParsedDate = items.map(item => ({
    ...item,
    _parsedDate: new Date(item.date).getTime()
  }));

  return itemsWithParsedDate
    .sort((a, b) => b._parsedDate - a._parsedDate)
    .map(({ _parsedDate, ...rest }) => rest as T);
};
```

---

## 5. Core Web Vitals

### 5.1 LCP (Largest Contentful Paint)

#### 현재 예상 이슈
- 히어로 이미지 크기 (2-4MB)
- preload 없음
- 폰트 로딩 지연

#### 개선 방안

| 개선 항목 | 예상 효과 |
|----------|----------|
| 히어로 이미지 압축 (4MB → 200KB) | LCP 2-3초 개선 |
| `<link rel="preload">` 추가 | LCP 0.5-1초 개선 |
| 폰트 preload | FOUT 제거, LCP 안정화 |
| `fetchpriority="high"` | LCP 우선순위 향상 |

```typescript
// HeroSection.tsx - 이미 적용됨 (좋음)
<img
  loading="eager"
  fetchPriority="high"
  // ...
/>
```

---

### 5.2 FID (First Input Delay)

#### 현재 상태: 양호

- 코드 스플리팅으로 초기 JS 번들 최소화
- 이벤트 핸들러 대부분 최적화됨
- 무거운 동기 작업 없음

#### 잠재적 이슈

```typescript
// JSON.stringify in SEOHelmet - 영향 미미
{structuredDataArray.map((data, index) => (
  <script type="application/ld+json">
    {JSON.stringify(data)}  // 소량 데이터, 영향 적음
  </script>
))}
```

---

### 5.3 CLS (Cumulative Layout Shift)

#### 현재 이슈

**1. 이미지 크기 미지정**

```typescript
// Before: 크기 없음 → 레이아웃 시프트 발생
<img src={image.url} alt={description} loading="lazy" />
```

```typescript
// After: width/height 또는 aspect-ratio 지정
<img
  src={image.url}
  alt={description}
  loading="lazy"
  width={800}
  height={600}
  className="aspect-video object-cover"
/>
```

**2. 폰트 로딩 시 레이아웃 시프트**

```css
/* Before: 폰트 스왑 시 레이아웃 변경 */
@font-face {
  font-family: 'GMarketSans';
  src: url('/fonts/GMarketSans.woff2');
}

/* After: size-adjust로 폴백 폰트 크기 맞춤 */
@font-face {
  font-family: 'GMarketSans';
  src: url('/fonts/GMarketSans.woff2');
  font-display: swap;
  size-adjust: 100%;  /* 폴백 폰트와 크기 일치 */
}
```

---

## 우선순위별 액션 아이템

### Critical (즉시)
- [ ] 캠프 이미지 압축 (2-4MB → 200KB 이하)
- [ ] 오디오 파일 최적화 (MP3 → Opus, 스트리밍 적용)
- [ ] `public/index.html`에 preload/prefetch 추가

### High (1주 내)
- [ ] `MusiciansSection`, `DesktopMenu`, `MobileMenu`, `MusicianModal`에 React.memo 적용
- [ ] `NavigationDropdown` useEffect 의존성 안정화
- [ ] 폰트 preload 추가

### Medium (2주 내)
- [ ] `TracksSection` 인라인 핸들러 최적화
- [ ] `NavigationDropdown` isActive useMemo 적용
- [ ] 이미지에 width/height 속성 추가 (CLS 개선)
- [ ] 번들 분석 도구 (source-map-explorer) 추가

### Low (1달 내)
- [ ] Date 객체 생성 최적화 (sorting.ts)
- [ ] 사용하지 않는 의존성 제거 확인
- [ ] AVIF 포맷 지원 추가
- [ ] Service Worker 오프라인 캐싱 구현

---

## 참고 자료

- [React Performance Optimization](https://react.dev/reference/react/memo)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Audio Optimization](https://developer.mozilla.org/en-US/docs/Web/Media/Audio_and_video_delivery)
- [Resource Hints](https://web.dev/preload-critical-assets/)
