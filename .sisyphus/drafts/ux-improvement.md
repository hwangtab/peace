# Draft: UX 개선 계획

## Requirements (confirmed)
- **개선 영역**: 전체 사이트 개선 + 성능 최적화
- **특별한 사용자 피드백**: 없음 (선제적 개선)

## 현재 상태 분석

### 기술 스택
- React 18 + TypeScript + Tailwind CSS
- Framer Motion (애니메이션)
- Howler.js + Wavesurfer.js (오디오 재생)
- React Router v6 (라우팅)
- Headless UI (접근성 컴포넌트)

### 현재 잘 구현된 부분
1. **Lazy Loading**: 페이지 레벨에서 `React.lazy()` 적용
2. **반응형 이미지**: Hero 섹션에서 srcSet/sizes 사용
3. **기본 a11y**: Skip links, aria-labels 구현
4. **SEO**: React Helmet + JSON-LD 구조화 데이터
5. **에러 처리**: ErrorBoundary 적용

### 개선 가능 영역 (발견된 이슈)

#### 성능
1. **이미지 최적화 미흡**
   - 갤러리 이미지에 lazy loading 미적용
   - blur placeholder 없음 (레이아웃 시프트 발생 가능)
   
2. **번들 사이즈**
   - framer-motion, wavesurfer.js 등 대용량 라이브러리
   - 코드 스플리팅 컴포넌트 레벨 미적용

3. **렌더링 최적화**
   - 스켈레톤 UI 없음 (단순 스피너만 존재)

#### UX 인터랙션
1. **오디오 플레이어**
   - 볼륨 조절 UI 없음
   - 미니 플레이어/플로팅 플레이어 없음
   - 플레이리스트 기능 없음

2. **갤러리**
   - 무한 스크롤/가상화 미적용 (많은 이미지 시 성능 저하)
   - 필터/정렬 기능 없음

3. **네비게이션**
   - 모바일 메뉴 애니메이션 개선 여지
   - 현재 위치 시각적 표시 강화 필요

4. **마이크로 인터랙션**
   - 호버/클릭 피드백 일관성 부족
   - 로딩 상태 표시 개선 필요

## Technical Decisions
- **우선순위**: 성능과 UX 균형잡힌 개선
- **개선 범위**: 대형 전면 개편 (1개월+ 작업)
- **타겟 장치**: 데스크톱 + 모바일 둘 다 중요
- **테스트 전략**: TDD (테스트 주도 개발) - Jest/Testing Library 활용
- **성능 벤치마크**: 별도 측정 없이 진행

## Scope Boundaries
- INCLUDE: 성능 최적화, UX 인터랙션 개선, 모바일/데스크톱 경험, 접근성, SEO
- EXCLUDE: (없음)

## Open Questions
- [ ] 구체적 개선 항목 우선순위
