# 성능 최적화 실행 계획

## 프로젝트 개요
- **프레임워크**: Next.js 14.2.5 + React 18.2.0
- **현재 상태**: 이미 많은 최적화 적용됨 (React.memo 15개, lazy loading, Next.js Image)
- **주요 이슈**: 갤러리 180개 이미지 DOM 누적, 불필요한 번들, 대형 컴포넌트

## 사용자 선택사항
- ✅ 모든 최적화 단계적 적용 (Sprint 1-4)
- ✅ 성능 우선 - Framer Motion 애니메이션 제거 허용
- ✅ 대형 컴포넌트 분리 진행

---

## Sprint 1: 즉시 적용 가능한 최적화 (1-2일)

### 1.1 wavesurfer.js 제거
**목표**: 미사용 라이브러리 제거로 번들 크기 1-2MB 감소

**작업**:
```bash
npm uninstall wavesurfer.js @types/wavesurfer.js
npm run build
npm run analyze
```

**영향받는 파일**:
- `/Users/hwang-gyeongha/peace/package.json` (13, 35번 줄)

**검증**:
- `/album/tracks` 페이지에서 오디오 플레이어 정상 동작 확인
- Howler.js만 사용하는지 Network 탭 확인

---

### 1.2 Index Key 안티패턴 수정
**목표**: React 재조정 최적화

#### CampGallery.tsx
**파일**: `/Users/hwang-gyeongha/peace/src/components/camp/CampGallery.tsx` (28번 줄)

**변경**:
```tsx
// Before: key={index}
// After:  key={img}  // img는 이미지 URL (string)
```

#### CampCard.tsx
**파일**: `/Users/hwang-gyeongha/peace/src/components/camp/CampCard.tsx` (64, 68번 줄)

**변경**:
```tsx
// Before: key={index}
// After:  key={typeof participant === 'string' ? participant : participant.name}
```

**검증**:
- `/camps/2023`, `/camps/2025` 페이지 렌더링 확인
- React DevTools에서 key 경고 없는지 확인

---

### 1.3 이미지 최적화 - loading 속성 추가
**목표**: 명시적 lazy loading으로 초기 로드 개선

#### GalleryImageItem.tsx
**파일**: `/Users/hwang-gyeongha/peace/src/components/gallery/GalleryImageItem.tsx` (36번 줄)

**추가**:
```tsx
<Image
  {...existing props}
  loading={priority ? 'eager' : 'lazy'}  // 추가
/>
```

#### AlbumAboutPage.tsx
**파일**: `/Users/hwang-gyeongha/peace/src/pages/album/AlbumAboutPage.tsx` (185-193번 줄)

**추가**:
```tsx
<Image
  {...existing props}
  loading="eager"
  quality={90}
/>
```

#### CampGallery.tsx
**파일**: `/Users/hwang-gyeongha/peace/src/components/camp/CampGallery.tsx` (38-45번 줄)

**추가**:
```tsx
<Image
  {...existing props}
  loading={index < 3 ? 'eager' : 'lazy'}
/>
```

**검증**:
- Chrome DevTools Network 탭에서 lazy 이미지가 viewport 진입 시 로드되는지 확인

---

## Sprint 2: 컴포넌트 리팩토링 (3-5일)

### 2.1 AlbumAboutPage 분리 (502줄 → ~150줄)
**목표**: 코드 가독성 향상, 코드 스플리팅 최적화

#### 새 컴포넌트 1: ConcertCard
**파일**: `/Users/hwang-gyeongha/peace/src/components/album/ConcertCard.tsx` (신규)
- **역할**: 318-395번 줄의 콘서트 카드 렌더링
- **Props**: `{ concert, onMusicianClick, index }`

#### 새 컴포넌트 2: AlbumTabContent
**파일**: `/Users/hwang-gyeongha/peace/src/components/album/AlbumTabContent.tsx` (신규)
- **역할**: 282-463번 줄의 탭 네비게이션 및 콘텐츠
- **Props**: `{ concerts, albumVideos, albumPhotos, onMusicianClick, onImageClick }`

#### 선택적 분리
- `AlbumHeroSection.tsx` (167-224번 줄)
- `AlbumMeaningSection.tsx` (226-268번 줄)

**영향받는 파일**:
- `/Users/hwang-gyeongha/peace/src/pages/album/AlbumAboutPage.tsx` (전체 리팩토링)

**검증**:
- `/album/about` 페이지 렌더링 확인
- 탭 전환 (info/video/photo) 동작 확인
- 뮤지션 클릭 시 모달 동작 확인
- 다국어 전환 테스트

---

### 2.2 TimelineItem 분리 (183줄 → ~80줄)
**목표**: 데스크톱/모바일 로직 명확히 분리

#### 새 컴포넌트 1: TimelineCardContent
**파일**: `/Users/hwang-gyeongha/peace/src/components/timeline/TimelineCardContent.tsx` (신규)
- **역할**: 58-71번 줄의 카드 내용

#### 새 컴포넌트 2: TimelineMobileCard
**파일**: `/Users/hwang-gyeongha/peace/src/components/timeline/TimelineMobileCard.tsx` (신규)
- **역할**: 82-124번 줄의 모바일 카드

#### 새 컴포넌트 3: TimelineYearLabel
**파일**: `/Users/hwang-gyeongha/peace/src/components/timeline/TimelineYearLabel.tsx` (신규)
- **역할**: 73-80번 줄의 연도 레이블

**영향받는 파일**:
- `/Users/hwang-gyeongha/peace/src/components/timeline/TimelineItem.tsx` (전체 리팩토링)

**검증**:
- 타임라인 섹션 렌더링 확인
- 모바일/데스크톱 레이아웃 전환 테스트
- 애니메이션 동작 확인

---

## Sprint 3: 아키텍처 개선 (5-7일)

### 3.1 SSG/ISR 적용
**목표**: 페이지 로드 시간 50-70% 감소

#### /camps/* 페이지 SSG 전환
**파일들**:
- `/Users/hwang-gyeongha/peace/pages/camps/2023.tsx`
- `/Users/hwang-gyeongha/peace/pages/camps/2025.tsx`
- `/Users/hwang-gyeongha/peace/pages/camps/2026.tsx`

**추가 코드** (각 파일):
```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ko', ['translation'], nextI18NextConfig)),
    },
    revalidate: 86400, // 24시간 ISR
  };
}
```

**검증**:
```bash
npm run build
# .next/server/pages/camps/*.html 파일 생성 확인
npm start
# 페이지 소스 보기에서 HTML 미리 렌더링 확인
```

---

### 3.2 Virtual Scrolling 구현 - react-window
**목표**: 180개 이미지 중 보이는 영역만 렌더링 (초기 렌더링 60-70% 개선)

#### Step 1: 라이브러리 설치
```bash
npm install react-window react-virtualized-auto-sizer
npm install --save-dev @types/react-window
```

#### Step 2: VirtualGalleryGrid 컴포넌트 생성
**파일**: `/Users/hwang-gyeongha/peace/src/components/gallery/VirtualGalleryGrid.tsx` (신규)

**핵심 구조**:
```tsx
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// 반응형 컬럼 수 계산
const useResponsiveColumns = () => {
  // 모바일: 2, 태블릿: 3, 데스크톱: 4
};

// Grid Cell 렌더링
const Cell = ({ columnIndex, rowIndex, style }) => {
  const index = rowIndex * columnCount + columnIndex;
  const image = images[index];

  return (
    <div style={style}>
      <GalleryImageItem
        image={image}
        priority={index < 8}
        onClick={onImageClick}
      />
    </div>
  );
};

// Grid 컴포넌트
<AutoSizer disableHeight>
  {({ width }) => (
    <Grid
      columnCount={columnCount}
      columnWidth={width / columnCount - 16}
      height={600}
      rowCount={Math.ceil(images.length / columnCount)}
      rowHeight={width / columnCount - 16}
      width={width}
      overscanRowCount={1}
    >
      {Cell}
    </Grid>
  )}
</AutoSizer>
```

#### Step 3: GallerySection 수정
**파일**: `/Users/hwang-gyeongha/peace/src/components/home/GallerySection.tsx` (65-86번 줄)

**변경**:
```tsx
// Before: AnimatePresence + motion.div + map
// After:
<VirtualGalleryGrid
  images={displayImages}
  onImageClick={setSelectedImage}
/>

// Load More 버튼은 유지 (88-97번 줄)
```

**주의사항**:
- ❌ 제거: AnimatePresence (68번 줄), motion.div (70-83번 줄)
- ✅ 유지: useGalleryImages hook의 pagination 로직
- ✅ 유지: Load More 버튼

**영향받는 파일**:
- `/Users/hwang-gyeongha/peace/src/components/home/GallerySection.tsx` (65-86번 줄)
- 신규: `/Users/hwang-gyeongha/peace/src/components/gallery/VirtualGalleryGrid.tsx`
- 신규: `/Users/hwang-gyeongha/peace/src/hooks/useResponsiveColumns.ts`

**검증**:
```bash
# Before/After 성능 측정
1. Chrome DevTools Performance 프로파일링
   - Before: 180개 DOM 노드
   - After: ~20-30개 DOM 노드만 렌더링
2. /gallery 페이지 접속 → 스크롤 테스트
3. Load More 버튼 클릭 → 이미지 추가 확인
4. 필터 변경 → Grid 리렌더링 확인
5. 반응형 테스트 (모바일/태블릿/데스크톱)
```

**예상 효과**:
- 초기 렌더링 시간: 60-70% 감소
- 메모리 사용량: 50% 감소
- FCP (First Contentful Paint): 대폭 개선

---

## Sprint 4 (선택 사항): 추가 최적화

### 4.1 Navigation Context (우선순위 낮음)
**파일**: `/Users/hwang-gyeongha/peace/src/contexts/NavigationContext.tsx` (신규)
- useNavigation hook의 props drilling 제거
- Navigation → DesktopMenu/MobileMenu props 전달 제거

### 4.2 AudioPlayer 동적 Import (우선순위 낮음)
**파일**: `/Users/hwang-gyeongha/peace/src/components/tracks/TrackCard.tsx`
- AudioPlayer를 dynamic import로 변경
- 초기 번들 ~20KB 감소 (다른 페이지)

---

## 실행 순서

```
Sprint 1 (1-2일) - 즉시 적용
├─ wavesurfer.js 제거
├─ Index key 수정
└─ 이미지 loading 속성 추가

Sprint 2 (3-5일) - 리팩토링
├─ AlbumAboutPage 분리
└─ TimelineItem 분리

Sprint 3 (5-7일) - 아키텍처
├─ SSG/ISR 적용
└─ Virtual Scrolling 구현 ⭐ 가장 큰 영향

Sprint 4 (선택) - 추가 최적화
├─ Navigation Context
└─ AudioPlayer 동적 import
```

---

## 성능 측정 전략

### Before (현재 상태)
```bash
npm run build
npm start
# Chrome DevTools Lighthouse 실행
# npm run analyze로 번들 분석
```

**측정 항목**:
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- TBT (Total Blocking Time)
- Bundle Size
- Gallery DOM 노드 수

### After (각 Sprint 완료 후)
동일한 방법으로 측정하여 Before/After 비교

**예상 개선 목표**:
- LCP: 2.5s → 1.5s (40% 개선)
- FCP: 1.8s → 1.0s (44% 개선)
- Bundle Size: 202MB → 180MB (11% 감소)
- Gallery 렌더링: 180 DOM 노드 → 30 노드 (83% 감소)

---

## 리스크 관리

### 높은 리스크
- **Virtual Scrolling (Sprint 3)**: Framer Motion 제거로 UX 변경
  - 대응: 사용자 승인 완료 ✅

### 중간 리스크
- **컴포넌트 분리 (Sprint 2)**: 대규모 리팩토링
  - 대응: 충분한 테스트, 기능별 점진적 분리

### 낮은 리스크
- Sprint 1의 모든 작업 (단순 설정 변경)

---

## Git 브랜치 전략

```bash
# Sprint별 브랜치 생성
git checkout -b perf/sprint1-quick-wins
git checkout -b perf/sprint2-refactor
git checkout -b perf/sprint3-architecture
git checkout -b perf/sprint4-optional

# 문제 발생 시 즉시 롤백
git checkout main
```

---

## 중요 파일 목록

### Sprint 1
- `/Users/hwang-gyeongha/peace/package.json`
- `/Users/hwang-gyeongha/peace/src/components/camp/CampGallery.tsx`
- `/Users/hwang-gyeongha/peace/src/components/camp/CampCard.tsx`
- `/Users/hwang-gyeongha/peace/src/components/gallery/GalleryImageItem.tsx`
- `/Users/hwang-gyeongha/peace/src/components/camp/CampGallery.tsx`

### Sprint 2
- `/Users/hwang-gyeongha/peace/src/pages/album/AlbumAboutPage.tsx`
- `/Users/hwang-gyeongha/peace/src/components/timeline/TimelineItem.tsx`

### Sprint 3 (핵심)
- `/Users/hwang-gyeongha/peace/src/components/home/GallerySection.tsx`
- `/Users/hwang-gyeongha/peace/src/hooks/useGalleryImages.ts`
- `/Users/hwang-gyeongha/peace/pages/camps/2023.tsx`
- `/Users/hwang-gyeongha/peace/pages/camps/2025.tsx`
- `/Users/hwang-gyeongha/peace/pages/camps/2026.tsx`

---

## 검증 방법

### 기능 테스트
1. **갤러리**: 이미지 로드, 필터 변경, Load More, 라이트박스
2. **캠프**: 페이지 렌더링, 이미지 갤러리, 참가자 목록
3. **앨범**: 탭 전환, 뮤지션 모달, 비디오/사진 표시
4. **타임라인**: 데스크톱/모바일 레이아웃, 애니메이션
5. **다국어**: 13개 언어 전환 테스트

### 성능 테스트
```bash
# Lighthouse 점수
npm run build && npm start
# Chrome DevTools → Lighthouse → Performance

# Bundle 분석
npm run analyze

# Core Web Vitals
# Chrome DevTools → Performance → Record
```

### 회귀 테스트
```bash
npm test  # Jest 테스트 실행
npm run lint  # ESLint 검증
```

---

## 추가 검토 사항

### Next.js 설정 최적화 (next.config.js)
```js
// 추가 고려사항
compiler: {
  removeConsole: process.env.NODE_ENV === 'production',
},
images: {
  formats: ['image/webp'],
},
```

### Font Optimization
- next/font 사용 여부 확인 및 적용 검토

### Third-party Scripts
- Google Analytics, 외부 스크립트 최적화

---

## 예상 일정
- **Sprint 1**: 1-2일 (빠른 성과)
- **Sprint 2**: 3-5일 (코드 품질 개선)
- **Sprint 3**: 5-7일 (가장 큰 성능 개선)
- **Sprint 4**: 선택 사항

**총 소요 시간**: 약 2주 (Sprint 1-3만 진행 시)
