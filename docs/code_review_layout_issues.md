# Code Review: Album Page Layout and Style Inconsistencies

## 1. 개요 (Summary)

현재 앨범의 **참여 뮤지션** (`/album/musicians`) 및 **수록곡** (`/album/tracks`) 페이지에서 불필요한 상하단 중복 패딩이 적용되고 있으며, 특히 수록곡 페이지의 경우 의도치 않은 배경색 차이로 인해 페이지 상하단에 띠(band)가 생기는 문제가 발견되었습니다.

이 문서는 문제의 원인을 분석하고, 프로젝트의 다른 부분에서 이미 사용되고 있는 모범 사례를 적용하여 구조적으로 일관성을 유지하는 해결책을 제안합니다.

## 2. 문제 원인 분석 (Root Cause Analysis)

### 2.1. 중복 패딩 (Double Padding)

- **문제 현상**: 페이지 최상단과 최하단에 과도한 공백이 존재합니다.
- **원인**: 현재 구조는 다음과 같이 두 개의 컴포넌트가 각각 수직 패딩을 적용하고 있기 때문입니다.
    1.  **`PageLayout.tsx`**: 페이지 전체의 래퍼(wrapper) 역할을 하며, 자체적으로 상단(`pt-24 md:pt-32`) 및 하단(`pb-16 md:pb-24`) 패딩을 가집니다.
    2.  **`Section.tsx`**: 페이지 내부의 콘텐츠 섹션 역할을 하며, `MusiciansSection`과 `TracksSection` 내에서 사용됩니다. 이 컴포넌트 또한 자체적으로 상하단 패딩(`py-16 md:py-24`)을 적용합니다.

결과적으로 `PageLayout`의 패딩과 그 안에 포함된 `Section`의 패딩이 더해져 중복 패딩이 발생합니다.

### 2.2. 배경색 불일치 (Background Color Inconsistency)

- **문제 현상**: 수록곡 페이지에서, 페이지의 실제 콘텐츠 영역과 상하단 패딩 영역의 배경색이 달라 띠처럼 보입니다.
- **원인**:
    - `AlbumTracksPage.tsx`에서는 `PageLayout`에 `background="white"`를 전달합니다.
    - 하지만 그 안에 렌더링되는 `TracksSection.tsx` 컴포넌트는 내부의 `Section` 컴포넌트에 `background="sky-horizon"`을 전달합니다.
    - 이로 인해 `PageLayout`이 적용하는 패딩 영역은 흰색(`white`)으로, `Section`이 적용하는 콘텐츠 영역은 하늘색(`sky-horizon`)으로 나뉘어 보이게 됩니다.

## 3. 관련 파일 (Affected Files)

- `src/pages/album/AlbumMusiciansPage.tsx`
- `src/pages/album/AlbumTracksPage.tsx`
- `src/components/home/MusiciansSection.tsx`
- `src/components/home/TracksSection.tsx`
- `src/components/layout/PageLayout.tsx`
- `src/components/layout/Section.tsx`

## 4. 해결 방안 (Proposed Solution)

이 문제는 이미 `GalleryPage`와 `GallerySection`에서 해결된 선례가 존재합니다. `GallerySection`은 `enableSectionWrapper`라는 prop을 통해 내부 `Section` 컴포넌트의 렌더링 여부를 제어할 수 있습니다. 이와 동일한 패턴을 적용하여 문제를 구조적으로 해결합니다.

### Step 1: `MusiciansSection` 및 `TracksSection` 리팩토링

`MusiciansSection.tsx`와 `TracksSection.tsx`에 `enableSectionWrapper` prop을 추가합니다. 이 prop의 기본값은 `true`로 설정하여 기존에 이 컴포넌트들을 사용하던 다른 페이지(예: 홈페이지)에 영향을 주지 않도록 합니다.

**`MusiciansSection.tsx` 수정 예시:**

```tsx
interface MusiciansSectionProps {
  enableSectionWrapper?: boolean;
}

const MusiciansSection: React.FC<MusiciansSectionProps> = ({ enableSectionWrapper = true }) => {
  // ... existing code ...

  const content = (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* ... h2, p, grid ... */}
    </div>
  );

  if (enableSectionWrapper) {
    return (
      <Section id="musicians" background="white">
        {content}
      </Section>
    );
  }

  return content;
};
```

`TracksSection.tsx`도 위와 동일한 방식으로 수정합니다.

### Step 2: `AlbumMusiciansPage` 및 `AlbumTracksPage` 수정

두 페이지 파일에서 `PageLayout`을 사용하되, 새로 추가한 `enableSectionWrapper` prop과 `background` prop을 올바르게 설정합니다.

1.  **`AlbumMusiciansPage.tsx` 수정:**
    - `MusiciansSection`에 `enableSectionWrapper={false}`를 전달하여 내부 `Section`의 중복 패딩과 배경을 제거합니다.
    - `PageLayout`의 `background`를 `MusiciansSection`의 원래 배경색이었던 `white`로 설정합니다.

    ```tsx
    const AlbumMusiciansPage = () => (
      <PageLayout
        title="..."
        description="..."
        keywords="..."
        background="white" // This should be 'white'
      >
        <MusiciansSection enableSectionWrapper={false} />
      </PageLayout>
    );
    ```

2.  **`AlbumTracksPage.tsx` 수정:**
    - `TracksSection`에 `enableSectionWrapper={false}`를 전달합니다.
    - `PageLayout`의 `background`를 `TracksSection`의 원래 배경색이었던 `sky-horizon`으로 설정하여 페이지 전체의 배경색을 일치시킵니다.

    ```tsx
    const AlbumTracksPage = () => (
      <PageLayout
        title="..."
        description="..."
        keywords="..."
        background="sky-horizon" // Change from 'white' to 'sky-horizon'
      >
        <TracksSection enableSectionWrapper={false} />
      </PageLayout>
    );
    ```

## 5. 기대 효과 (Expected Outcome)

- `PageLayout`이 패딩과 배경색을 모두 제어하게 되어 중복 패딩 문제가 해결됩니다.
- 페이지 전체의 배경색이 일관되게 적용되어 디자인 통일성이 확보됩니다.
- 기존 컴포넌트의 재사용성을 높이고, 프로젝트 전반에 걸쳐 일관된 개발 패턴을 유지합니다.
