# 웹사이트 다국어(Multilingual) 버전 구축 계획안

전세계 평화연대자들과 함께하기 위한 웹사이트의 다국어(영어, 한국어 등) 지원 구축 계획입니다.

## 1. 기술 스택 및 라이브러리 선정
리액트 생태계에서 가장 널리 사용되고 검증된 라이브러리를 사용합니다.

*   **메인 라이브러리**: `react-i18next`
    *   React 컴포넌트와 훅(Hook)을 사용하여 직관적으로 다국어를 적용할 수 있습니다.
*   **코어 라이브러리**: `i18next`
*   **언어 감지**: `i18next-browser-languagedetector`
    *   사용자의 브라우저 언어 설정을 자동으로 감지하여 초기 언어를 설정합니다.
*   **백엔드 로드(선택)**: `i18next-http-backend`
    *   번역 파일(JSON)을 비동기로 로딩할 때 사용합니다. (초기에는 정적 import로 시작하는 것을 권장)

## 2. 폴더 구조 및 파일 관리
번역 텍스트를 소스 코드와 분리하여 관리하기 위한 구조입니다.

```
src/
├── locales/
│   ├── ko/
│   │   └── translation.json  # 한국어 텍스트 모음
│   ├── en/
│   │   └── translation.json  # 영어 텍스트 모음
│   └── ja/                   # (예시) 일본어 추가 시
│       └── translation.json
├── i18n/
│   └── config.ts             # i18next 설정 파일
...
```

### 폴더 구조 설명
*   **locales/**: 각 언어별 번역 파일을 저장하는 폴더입니다.
*   **translation.json**: 실제 번역된 텍스트가 `key: value` 형태로 저장됩니다.
    *   예: `{ "welcome": "환영합니다", "menu_about": "소개" }`
*   **config.ts**: i18n 라이브러리 초기화 및 설정을 담당합니다.

## 3. 구축 단계별 프로세스 (Step-by-Step)

### 1단계: 라이브러리 설치 및 설정
*   필요한 패키지 설치: `npm install react-i18next i18next i18next-browser-languagedetector`
*   `src/i18n/config.ts` 파일 생성 및 기본 설정 작성.

### 2단계: 번역 리소스 파일 생성 (JSON)
*   **한국어(ko)**: 기존 사이트의 모든 텍스트를 추출하여 `locales/ko/translation.json`에 정리합니다.
*   **영어(en)**: 한국어 내용을 바탕으로 영문 번역을 진행하여 `locales/en/translation.json`에 기입합니다.
    *   *Tip: 텍스트 양이 많으므로 주요 메뉴와 메인 페이지부터 우선 적용하며 점진적으로 확대합니다.*

### 3단계: 컴포넌트에 적용
*   기존의 하드코딩된 한글 텍스트를 `useTranslation` 훅을 사용하여 교체합니다.
    ```tsx
    // 변경 전
    <h1>안녕하세요</h1>
    
    // 변경 후
    const { t } = useTranslation();
    <h1>{t('greeting')}</h1>
    ```

### 4단계: 언어 변경 UI (Language Switcher) 구현
*   헤더(Header)나 푸터(Footer)에 언어 전환 버튼(KR / EN)을 배치합니다.
*   클릭 시 `i18n.changeLanguage('en')` 함수를 호출하여 즉시 언어가 바뀌도록 구현합니다.

### 5단계: 라우팅 및 SEO 전략 (중요)
*   **전략 A (권장 - Query Parameter)**: `peaceandmusic.net?lang=en`
    *   구현이 가장 간단하고 기존 라우팅 구조를 크게 해치지 않습니다.
    *   링크 공유 시 `?lang=en`만 붙여서 공유하면 해당 언어로 열립니다.
*   **전략 B (URL Path)**: `peaceandmusic.net/en/...`
    *   SEO에 가장 유리하지만, GitHub Pages 배포 환경(SPA)에서는 404 리다이렉트 처리 등 추가 설정이 복잡할 수 있습니다.
*   **결론**: 우선 감지 및 로컬 스토리지 방식을 사용하며, 필요 시 Query Parameter 방식을 병행하는 것을 추천합니다.

## 4. 콘텐츠 번역 계획
*   **UI 텍스트**: 메뉴, 버튼, 안내 문구 등 (즉시 적용)
*   **아카이브 콘텐츠(Article)**:
    *   기존 데이터 파일(`data/*.ts` 등)에 영문 필드를 추가해야 합니다.
    *   구조 변경 예시:
        ```typescript
        // 기존
        title: "강정 평화 음악 캠프"
        
        // 변경
        title: {
            ko: "강정 평화 음악 캠프",
            en: "Gangjeong Peace Music Camp"
        }
        ```
    *   컴포넌트에서 현재 언어(`i18n.language`)에 따라 적절한 필드를 보여주도록 로직 수정이 필요합니다.

## 5. 예상 소요 시간 및 일정
*   **설정 및 구조 잡기**: 1~2일
*   **텍스트 추출 및 UI 적용**: 3~4일
*   **영문 번역 및 검수**: (번역량에 따라 다름)
*   **테스트 및 배포**: 1~2일

## 6. 향후 확장성
*   영어 외에 일본어, 프랑스어 등 다른 언어 추가 시 `translations.json` 파일만 추가하면 쉽게 확장 가능합니다.
