# 다국어 Noto 폰트 시스템 전환 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 13개 로케일(라틴·키릴·데바나가리·아랍·CJK 3종·한글)을 전부 의도한 폰트로 렌더하도록, 본문을 Noto Sans 풀세트로, 제목 세리프를 Noto Serif KR(한국어 정체성 한정)로 교체한다.

**Architecture:** `@font-face`는 `unicode-range`로 스크립트별 분할 선언해 브라우저가 페이지에 등장한 스크립트의 woff2만 받게 한다. body 폰트 스택은 `html:lang(...)` 분기로 우선순위를 제어한다(SSG로 페이지마다 lang이 고정되므로 각 페이지가 자기 언어 폰트만 우선 적용). 세리프(`font-display`/`serif`)는 `['Noto Serif KR', 'Noto Sans', ...]` 스택이라 비한글 제목은 산스로 자연 폴백된다. 포인트 폰트 PartialSans는 한글 정체성 한정으로 유지하되 preload 범위를 사용처로 좁힌다.

**Tech Stack:** Next.js(pages router), Tailwind CSS, `pyftsubset`(fonttools), Noto Sans/Serif(OFL, Google Fonts), Playwright(시각 검증).

## Global Constraints

- 의존성은 **pnpm**. `package.json` 변경 시 `pnpm-lock.yaml` 함께 커밋.
- 커밋 전 **prettier** 필수 (`pnpm format:check` 통과해야 CI 통과).
- 폰트 원본은 `src/fonts/source/`(비공개, 서빙 안 됨), 서브셋 출력은 `public/fonts/*.subset.woff2`(서빙됨).
- 모든 `@font-face`에 `font-display: swap`.
- `/fonts/*`는 `immutable` 1년 캐시 + `?v=N` 쿼리로 버스팅(현행 유지, 이번에 `v=3`으로 올림).
- 13 로케일: `ko, en, es, fr, de, pt, ru, ar, ja, zh-Hans, zh-Hant, hi, id` (`src/constants/locales.js`).
- 작업 완료 후 `git push origin main`.

---

## File Structure

| 파일 | 책임 | 변경 |
|---|---|---|
| `src/fonts/source/` | Noto 원본 ttf/otf 보관 (비공개) | 신규 폰트 추가 |
| `scripts/subset-fonts.py` | 로케일 글자 수집 → 폰트별 서브셋 woff2 생성 | FONTS 목록·CJK 안전집합 확장 |
| `public/fonts/*.subset.woff2` | 서빙되는 서브셋 폰트 | Noto 산출물로 교체 |
| `src/index.css` | `@font-face` 선언 + body/lang 폰트 스택 | 전면 재작성 |
| `tailwind.config.js` | `fontFamily` 시맨틱 토큰 | Noto 스택으로 교체 |
| `pages/_document.tsx` | LCP 폰트 preload | Noto preload로 교체, PartialSans 범위 축소 |
| `scripts/verify-font-coverage.py` | 산출물 woff2 cmap 커버리지 검증 (신규) | 신규 생성 |

---

## Task 1: 폰트 원본 수급 및 배치

**Files:**
- Create: `src/fonts/source/NotoSans-Regular.ttf`, `NotoSans-Medium.ttf`, `NotoSans-Bold.ttf` (라틴·키릴·그리스)
- Create: `src/fonts/source/NotoSansKR-Light.ttf`, `-Regular.ttf`, `-Medium.ttf`, `-SemiBold.ttf`, `-Bold.ttf` (한글)
- Create: `src/fonts/source/NotoSansJP-Regular.ttf`, `-Bold.ttf` (일본어 가나+한자)
- Create: `src/fonts/source/NotoSansSC-Regular.ttf`, `-Bold.ttf` (간체)
- Create: `src/fonts/source/NotoSansTC-Regular.ttf`, `-Bold.ttf` (번체)
- Create: `src/fonts/source/NotoSansDevanagari-Regular.ttf`, `-Bold.ttf` (힌디)
- Create: `src/fonts/source/NotoSansArabic-Regular.ttf`, `-Bold.ttf` (아랍)
- Create: `src/fonts/source/NotoSerifKR-Bold.ttf` (제목 세리프; 한글+라틴)

**Interfaces:**
- Produces: `src/fonts/source/`에 위 파일들이 존재. Task 2의 `FONTS` 목록이 이 파일명을 정확히 참조한다.

- [ ] **Step 1: Google Fonts에서 정적 weight ttf 수급**

각 폰트는 OFL 라이선스. Google Fonts 또는 google-webfonts-helper에서 정적(static) instance ttf로 받는다. 가변폰트(VF) ttf를 받았다면 정적 instance를 추출:

```bash
# 예: NotoSansKR VF에서 weight 400 정적 추출 (fonttools 설치 가정)
pip install fonttools brotli
fonttools varLib.instancer src/fonts/source/NotoSansKR-VF.ttf wght=400 \
  -o src/fonts/source/NotoSansKR-Regular.ttf
# weight 300/500/600/700도 동일하게 wght=300/500/600/700 로 추출
```

라틴 Noto Sans는 키릴·그리스를 포함하므로 별도 키릴 폰트 불필요. Noto Sans JP/SC/TC는 각자 CJK Unified 한자를 포함한다.

- [ ] **Step 2: 파일 배치 확인**

Run:
```bash
ls -1 src/fonts/source/ | grep -E '^Noto' | sort
```
Expected: 위 Files 목록의 17개 ttf가 모두 출력. 누락 시 Step 1 반복.

- [ ] **Step 3: 커버리지 즉시 점검 (수급 폰트가 실제로 해당 스크립트를 담는지)**

Run:
```bash
python3 - <<'PY'
from fontTools.ttLib import TTFont
checks = [
  ("NotoSansKR-Regular.ttf", 0xAC00, "한글 가"),
  ("NotoSansJP-Regular.ttf", 0x4E2D, "한자 中"),
  ("NotoSansSC-Regular.ttf", 0x4E2D, "한자 中"),
  ("NotoSansTC-Regular.ttf", 0x4E2D, "한자 中"),
  ("NotoSansDevanagari-Regular.ttf", 0x0915, "데바나가리 क"),
  ("NotoSansArabic-Regular.ttf", 0x0628, "아랍 ب"),
  ("NotoSans-Regular.ttf", 0x0410, "키릴 А"),
  ("NotoSerifKR-Bold.ttf", 0xAC00, "한글 가"),
]
import sys
ok = True
for fn, cp, label in checks:
    cmap = TTFont(f"src/fonts/source/{fn}").getBestCmap()
    has = cp in cmap
    print(("OK " if has else "FAIL"), fn, label)
    ok = ok and has
sys.exit(0 if ok else 1)
PY
```
Expected: 모든 줄 `OK`. `FAIL`이 있으면 잘못된 서브패밀리를 받은 것 — 해당 폰트 재수급.

- [ ] **Step 4: Commit** (source는 .gitignore 여부 확인 후)

```bash
# src/fonts/source 가 gitignore 되어 있으면 (서빙 안 되는 비공개 원본) 커밋 불필요.
git check-ignore src/fonts/source/NotoSansKR-Regular.ttf && echo "ignored (커밋 생략)" || {
  git add src/fonts/source/
  git commit -m "chore(fonts): Noto Sans 풀세트 + Noto Serif KR 원본 추가"
}
```

---

## Task 2: 서브셋 스크립트 확장 (CJK/데바나가리/아랍 + 안전집합)

**Files:**
- Modify: `scripts/subset-fonts.py` (FONTS 목록, `build_safety_floor`, `strip_empty_glyph_cmaps` 적용 범위)

**Interfaces:**
- Consumes: Task 1의 `src/fonts/source/Noto*.ttf`
- Produces: `public/fonts/` 아래 다음 산출물 —
  `NotoSans-{Regular,Medium,Bold}.subset.woff2`,
  `NotoSansKR-{Light,Regular,Medium,SemiBold,Bold}.subset.woff2`,
  `NotoSansJP-{Regular,Bold}.subset.woff2`,
  `NotoSansSC-{Regular,Bold}.subset.woff2`,
  `NotoSansTC-{Regular,Bold}.subset.woff2`,
  `NotoSansDevanagari-{Regular,Bold}.subset.woff2`,
  `NotoSansArabic-{Regular,Bold}.subset.woff2`,
  `NotoSerifKR-Bold.subset.woff2`.
  Task 3의 `@font-face src` 경로가 이 파일명을 참조.

- [ ] **Step 1: `FONTS` 목록 교체**

`scripts/subset-fonts.py`의 `FONTS` 리스트를 아래로 교체한다(기존 S-Core/Bookk/Partial 항목 제거, PartialSans는 별도 유지 결정 — 아래 주석 참조):

```python
FONTS: list[tuple[str, str, str]] = [
    # (src filename, dst filename, flavor)
    # 본문 산스 = Noto Sans 풀세트(스크립트별 분할), 제목 세리프 = Noto Serif KR.
    # PartialSans 는 포인트 폰트로 유지(한글 정체성 한정).
    ("NotoSans-Regular.ttf", "NotoSans-Regular.subset.woff2", "woff2"),
    ("NotoSans-Medium.ttf", "NotoSans-Medium.subset.woff2", "woff2"),
    ("NotoSans-Bold.ttf", "NotoSans-Bold.subset.woff2", "woff2"),
    ("NotoSansKR-Light.ttf", "NotoSansKR-Light.subset.woff2", "woff2"),
    ("NotoSansKR-Regular.ttf", "NotoSansKR-Regular.subset.woff2", "woff2"),
    ("NotoSansKR-Medium.ttf", "NotoSansKR-Medium.subset.woff2", "woff2"),
    ("NotoSansKR-SemiBold.ttf", "NotoSansKR-SemiBold.subset.woff2", "woff2"),
    ("NotoSansKR-Bold.ttf", "NotoSansKR-Bold.subset.woff2", "woff2"),
    ("NotoSansJP-Regular.ttf", "NotoSansJP-Regular.subset.woff2", "woff2"),
    ("NotoSansJP-Bold.ttf", "NotoSansJP-Bold.subset.woff2", "woff2"),
    ("NotoSansSC-Regular.ttf", "NotoSansSC-Regular.subset.woff2", "woff2"),
    ("NotoSansSC-Bold.ttf", "NotoSansSC-Bold.subset.woff2", "woff2"),
    ("NotoSansTC-Regular.ttf", "NotoSansTC-Regular.subset.woff2", "woff2"),
    ("NotoSansTC-Bold.ttf", "NotoSansTC-Bold.subset.woff2", "woff2"),
    ("NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari-Regular.subset.woff2", "woff2"),
    ("NotoSansDevanagari-Bold.ttf", "NotoSansDevanagari-Bold.subset.woff2", "woff2"),
    ("NotoSansArabic-Regular.ttf", "NotoSansArabic-Regular.subset.woff2", "woff2"),
    ("NotoSansArabic-Bold.ttf", "NotoSansArabic-Bold.subset.woff2", "woff2"),
    ("NotoSerifKR-Bold.ttf", "NotoSerifKR-Bold.subset.woff2", "woff2"),
]
```

- [ ] **Step 2: 동적 콘텐츠 대비 한글·CJK 안전집합 추가**

게시판/회원 입력 등 동적 콘텐츠는 정적 소스에 없어 서브셋에서 누락된다(리뷰 지적사항). `build_safety_floor()` 끝에 한글 상용 음절과 CJK 상용 한자 floor를 추가한다:

```python
    # --- 동적 콘텐츠(게시판·댓글·회원명) 대비 안전집합 ---
    # 한글: 완성형 음절 전체(AC00–D7A3). 자모 조합형이라 글리프 수 대비
    # woff2 증가폭이 제한적이고, 사용자 입력 한글 누락을 원천 차단한다.
    out.update(chr(c) for c in range(0xAC00, 0xD7A3 + 1))
    # CJK: 상용 한자 floor — 한·중·일 입력 대비. CJK Unified 전체는 과중하므로
    # 통상 상용역(기본 한자 + 확장 일부)만. (zh/ja 로케일 콘텐츠는 collect 단계에서
    # 이미 포함되며, 여기 floor 는 동적 입력 누락 방지용 보강.)
    out.update(chr(c) for c in range(0x4E00, 0x9FFF + 1))  # CJK Unified Ideographs
    return out
```

> 주의: CJK Unified 전체(약 2만자)를 floor에 넣으면 JP/SC/TC 서브셋이 각각 커진다(예상 woff2 1.5~3MB/폰트). 용량이 문제면 Step 4 측정 후, floor를 상용 한자 표(예: 통용규범한자/조요한자/KS X 1001 한자)로 좁히는 것을 Task 7에서 재검토한다. 1차 구현은 안전(전체 포함) 우선.

- [ ] **Step 3: 서브셋 실행**

Run:
```bash
pnpm fonts:subset
```
Expected: 각 폰트별 `KB -> KB (-NN%)` 로그가 19개 출력되고 마지막 `Total:` 라인. `SKIP (missing)`이 있으면 Task 1 파일명 불일치 — 수정.

- [ ] **Step 4: 산출물 존재·크기 확인**

Run:
```bash
ls -la public/fonts/Noto*.subset.woff2 | wc -l   # 19 이어야 함
du -h public/fonts/Noto*.subset.woff2 | sort -h | tail -5  # 가장 큰 CJK 폰트 크기 확인
```
Expected: 19개 파일. CJK 폰트가 과도하게 크면(>3MB) Step 2 주석대로 floor 축소를 Task 7에서 검토.

- [ ] **Step 5: Commit**

```bash
git add scripts/subset-fonts.py public/fonts/Noto*.subset.woff2
git commit -m "feat(fonts): Noto 다국어 서브셋 파이프라인 + 동적 콘텐츠 안전집합"
```

---

## Task 3: 산출물 커버리지 검증 스크립트 (신규)

**Files:**
- Create: `scripts/verify-font-coverage.py`

**Interfaces:**
- Consumes: Task 2의 `public/fonts/Noto*.subset.woff2`
- Produces: 종료코드 0/1 (각 로케일 대표 글자가 해당 서브셋에 존재하는지 assert). CI/수동 검증에서 회귀 방지로 사용.

- [ ] **Step 1: 검증 스크립트 작성**

```python
#!/usr/bin/env python3
"""서브셋 산출물이 각 스크립트의 대표 글자를 담는지 검증한다.

폰트 교체·서브셋 floor 변경 후 회귀(특정 언어 글리프 누락) 방지용.
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont

FONT_DIR = Path(__file__).resolve().parent.parent / "public" / "fonts"

# (서브셋 파일명, 대표 코드포인트, 라벨)
CASES = [
    ("NotoSansKR-Regular.subset.woff2", 0xAC00, "한글 가"),
    ("NotoSansKR-Regular.subset.woff2", 0xB766, "확장음절 뮁"),  # 동적 입력 대비 floor 확인
    ("NotoSansJP-Regular.subset.woff2", 0x4E2D, "한자 中"),
    ("NotoSansJP-Regular.subset.woff2", 0x3042, "가나 あ"),
    ("NotoSansSC-Regular.subset.woff2", 0x4E2D, "간체 中"),
    ("NotoSansTC-Regular.subset.woff2", 0x4E2D, "번체 中"),
    ("NotoSansDevanagari-Regular.subset.woff2", 0x0915, "데바나가리 क"),
    ("NotoSansArabic-Regular.subset.woff2", 0x0628, "아랍 ب"),
    ("NotoSans-Regular.subset.woff2", 0x0410, "키릴 А"),
    ("NotoSans-Regular.subset.woff2", 0x0041, "라틴 A"),
    ("NotoSerifKR-Bold.subset.woff2", 0xAC00, "세리프 한글 가"),
    ("NotoSerifKR-Bold.subset.woff2", 0x0041, "세리프 라틴 A"),
]


def main() -> int:
    ok = True
    for fn, cp, label in CASES:
        path = FONT_DIR / fn
        if not path.exists():
            print(f"FAIL  {fn} 없음 ({label})")
            ok = False
            continue
        cmap = TTFont(str(path)).getBestCmap()
        has = cp in cmap
        print(("OK   " if has else "FAIL ") + f"{fn}  {label}")
        ok = ok and has
    if not ok:
        print("\n커버리지 검증 실패 — 서브셋 floor/원본 폰트를 확인하세요.", file=sys.stderr)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: 실행해서 통과 확인**

Run:
```bash
python3 scripts/verify-font-coverage.py
```
Expected: 12줄 모두 `OK`, 종료코드 0. `뮁`(확장음절)이 FAIL이면 Task 2 Step 2의 한글 floor가 빠진 것.

- [ ] **Step 3: package.json에 스크립트 등록**

`package.json`의 `"fonts:subset"` 줄 아래에 추가:

```json
    "fonts:subset": "python3 scripts/subset-fonts.py",
    "fonts:verify": "python3 scripts/verify-font-coverage.py",
```

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-font-coverage.py package.json
git commit -m "test(fonts): 서브셋 커버리지 검증 스크립트"
```

---

## Task 4: `@font-face` 재작성 + body/lang 폰트 스택 (src/index.css)

**Files:**
- Modify: `src/index.css` (라인 5~67 `@layer base` 내 `@font-face` 블록, 라인 70~88 `body`, 라인 75~88 `h1~h6`)

**Interfaces:**
- Consumes: Task 2의 산출물 woff2 (`?v=3`)
- Produces: CSS family 이름 — `'Noto Sans'`, `'Noto Sans KR'`, `'Noto Sans JP'`, `'Noto Sans SC'`, `'Noto Sans TC'`, `'Noto Sans Devanagari'`, `'Noto Sans Arabic'`, `'Noto Serif KR'`, `'PartialSans'`(유지). Task 5의 tailwind 스택이 이 이름을 참조.

- [ ] **Step 1: `@font-face` 블록 전면 교체**

`src/index.css`에서 기존 7개 폰트의 `@font-face`(BookkMyungjo/SCDream×5/PartialSans) 중 **PartialSans만 남기고** 나머지를 삭제한 뒤, 아래를 `@layer base {` 직후에 삽입한다. `unicode-range`로 스크립트를 분리해 브라우저가 필요한 파일만 받게 한다.

```css
  /* 모든 폰트는 scripts/subset-fonts.py 로 프로젝트 사용 글자 + 동적 콘텐츠
     안전집합만 남긴 서브셋. unicode-range 로 스크립트별 분할 → 페이지에 등장한
     스크립트의 woff2 만 다운로드. 자세한 매핑은 README/주석 참조. */

  /* ── 라틴·키릴·그리스 (Noto Sans 본체) ── */
  @font-face {
    font-family: 'Noto Sans';
    src: url('/fonts/NotoSans-Regular.subset.woff2?v=3') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
    unicode-range: U+0000-024F, U+0370-03FF, U+0400-04FF, U+1E00-1EFF, U+2000-206F, U+20A0-20BF;
  }
  @font-face {
    font-family: 'Noto Sans';
    src: url('/fonts/NotoSans-Medium.subset.woff2?v=3') format('woff2');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
    unicode-range: U+0000-024F, U+0370-03FF, U+0400-04FF, U+1E00-1EFF, U+2000-206F, U+20A0-20BF;
  }
  @font-face {
    font-family: 'Noto Sans';
    src: url('/fonts/NotoSans-Bold.subset.woff2?v=3') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
    unicode-range: U+0000-024F, U+0370-03FF, U+0400-04FF, U+1E00-1EFF, U+2000-206F, U+20A0-20BF;
  }

  /* ── 한글 (Noto Sans KR, 5웨이트: 기존 SCDream 웨이트 매핑 보존) ── */
  @font-face {
    font-family: 'Noto Sans KR';
    src: url('/fonts/NotoSansKR-Light.subset.woff2?v=3') format('woff2');
    font-weight: 300; font-style: normal; font-display: swap;
    unicode-range: U+AC00-D7A3, U+1100-11FF, U+3130-318F, U+A960-A97F, U+D7B0-D7FF;
  }
  @font-face {
    font-family: 'Noto Sans KR';
    src: url('/fonts/NotoSansKR-Regular.subset.woff2?v=3') format('woff2');
    font-weight: 400; font-style: normal; font-display: swap;
    unicode-range: U+AC00-D7A3, U+1100-11FF, U+3130-318F, U+A960-A97F, U+D7B0-D7FF;
  }
  @font-face {
    font-family: 'Noto Sans KR';
    src: url('/fonts/NotoSansKR-Medium.subset.woff2?v=3') format('woff2');
    font-weight: 500; font-style: normal; font-display: swap;
    unicode-range: U+AC00-D7A3, U+1100-11FF, U+3130-318F, U+A960-A97F, U+D7B0-D7FF;
  }
  @font-face {
    font-family: 'Noto Sans KR';
    src: url('/fonts/NotoSansKR-SemiBold.subset.woff2?v=3') format('woff2');
    font-weight: 600; font-style: normal; font-display: swap;
    unicode-range: U+AC00-D7A3, U+1100-11FF, U+3130-318F, U+A960-A97F, U+D7B0-D7FF;
  }
  @font-face {
    font-family: 'Noto Sans KR';
    src: url('/fonts/NotoSansKR-Bold.subset.woff2?v=3') format('woff2');
    font-weight: 700; font-style: normal; font-display: swap;
    unicode-range: U+AC00-D7A3, U+1100-11FF, U+3130-318F, U+A960-A97F, U+D7B0-D7FF;
  }

  /* ── 일본어 가나 (Noto Sans JP) — 한자는 lang 분기에서 JP/SC/TC 우선순위로 제어 ──
     주: CJK Unified(U+4E00-9FFF)는 JP/SC/TC 가 영역이 겹친다. @font-face 단계에선
     가나·일본어 구두점만 unicode-range 로 잡고, 한자 영역은 body 의 lang 분기
     font-family 순서로 해소한다(아래 Step 2). */
  @font-face {
    font-family: 'Noto Sans JP';
    src: url('/fonts/NotoSansJP-Regular.subset.woff2?v=3') format('woff2');
    font-weight: 400; font-style: normal; font-display: swap;
    unicode-range: U+3000-303F, U+3040-309F, U+30A0-30FF, U+FF00-FFEF, U+4E00-9FFF;
  }
  @font-face {
    font-family: 'Noto Sans JP';
    src: url('/fonts/NotoSansJP-Bold.subset.woff2?v=3') format('woff2');
    font-weight: 700; font-style: normal; font-display: swap;
    unicode-range: U+3000-303F, U+3040-309F, U+30A0-30FF, U+FF00-FFEF, U+4E00-9FFF;
  }

  /* ── 중국어 간체 (Noto Sans SC) ── */
  @font-face {
    font-family: 'Noto Sans SC';
    src: url('/fonts/NotoSansSC-Regular.subset.woff2?v=3') format('woff2');
    font-weight: 400; font-style: normal; font-display: swap;
    unicode-range: U+4E00-9FFF, U+3400-4DBF, U+F900-FAFF, U+3000-303F, U+FF00-FFEF;
  }
  @font-face {
    font-family: 'Noto Sans SC';
    src: url('/fonts/NotoSansSC-Bold.subset.woff2?v=3') format('woff2');
    font-weight: 700; font-style: normal; font-display: swap;
    unicode-range: U+4E00-9FFF, U+3400-4DBF, U+F900-FAFF, U+3000-303F, U+FF00-FFEF;
  }

  /* ── 중국어 번체 (Noto Sans TC) ── */
  @font-face {
    font-family: 'Noto Sans TC';
    src: url('/fonts/NotoSansTC-Regular.subset.woff2?v=3') format('woff2');
    font-weight: 400; font-style: normal; font-display: swap;
    unicode-range: U+4E00-9FFF, U+3400-4DBF, U+F900-FAFF, U+3000-303F, U+FF00-FFEF;
  }
  @font-face {
    font-family: 'Noto Sans TC';
    src: url('/fonts/NotoSansTC-Bold.subset.woff2?v=3') format('woff2');
    font-weight: 700; font-style: normal; font-display: swap;
    unicode-range: U+4E00-9FFF, U+3400-4DBF, U+F900-FAFF, U+3000-303F, U+FF00-FFEF;
  }

  /* ── 데바나가리 (힌디) ── */
  @font-face {
    font-family: 'Noto Sans Devanagari';
    src: url('/fonts/NotoSansDevanagari-Regular.subset.woff2?v=3') format('woff2');
    font-weight: 400; font-style: normal; font-display: swap;
    unicode-range: U+0900-097F, U+A8E0-A8FF, U+1CD0-1CFF;
  }
  @font-face {
    font-family: 'Noto Sans Devanagari';
    src: url('/fonts/NotoSansDevanagari-Bold.subset.woff2?v=3') format('woff2');
    font-weight: 700; font-style: normal; font-display: swap;
    unicode-range: U+0900-097F, U+A8E0-A8FF, U+1CD0-1CFF;
  }

  /* ── 아랍 ── */
  @font-face {
    font-family: 'Noto Sans Arabic';
    src: url('/fonts/NotoSansArabic-Regular.subset.woff2?v=3') format('woff2');
    font-weight: 400; font-style: normal; font-display: swap;
    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
  }
  @font-face {
    font-family: 'Noto Sans Arabic';
    src: url('/fonts/NotoSansArabic-Bold.subset.woff2?v=3') format('woff2');
    font-weight: 700; font-style: normal; font-display: swap;
    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
  }

  /* ── 제목 세리프 (한국어 정체성 한정; 한글+라틴) ── */
  @font-face {
    font-family: 'Noto Serif KR';
    src: url('/fonts/NotoSerifKR-Bold.subset.woff2?v=3') format('woff2');
    font-weight: 700; font-style: normal; font-display: swap;
    unicode-range: U+0000-024F, U+AC00-D7A3, U+1100-11FF, U+3130-318F, U+2000-206F;
  }

  /* ── 포인트 폰트 (유지) ── */
  @font-face {
    font-family: 'PartialSans';
    src: url('/fonts/PartialSansKR-Regular.subset.woff2?v=3') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
```

> PartialSans도 `?v=2` → `?v=3`으로 캐시 버스팅을 통일한다(서브셋 floor가 바뀌어 재생성되므로). Task 2의 `FONTS`에 PartialSans 항목을 다시 넣을지 여부: 유지하기로 했으므로 `("PartialSansKR-Regular.woff2", "PartialSansKR-Regular.subset.woff2", "woff2")` 한 줄을 Task 2 Step 1 `FONTS` 목록에 포함시킨다(원본 `src/fonts/source/PartialSansKR-Regular.woff2`는 이미 존재).

- [ ] **Step 2: body 폰트 스택 + lang 분기 작성**

기존 `body { font-family: 'SCDream', ... }`(라인 70~88 부근)을 아래로 교체한다. CJK 한자 영역이 겹치는 문제를 `html:lang(...)` 우선순위로 해소한다.

```css
  body {
    @apply bg-ocean-sand text-deep-ocean;
    /* 기본 스택: 라틴/한글 우선 + 모든 스크립트 폴백 나열.
       lang 분기에서 해당 언어 폰트를 맨 앞으로 끌어올린다. */
    font-family:
      'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC',
      'Noto Sans TC', 'Noto Sans Devanagari', 'Noto Sans Arabic',
      -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* lang 분기: 해당 언어 CJK 폰트를 한자 영역에서 최우선으로.
     SSG 라 페이지마다 <html lang> 고정 → 한 페이지엔 한 분기만 적용된다. */
  html:lang(ja) body {
    font-family:
      'Noto Sans', 'Noto Sans JP', 'Noto Sans KR',
      -apple-system, BlinkMacSystemFont, sans-serif;
  }
  html:lang(zh-Hans) body {
    font-family:
      'Noto Sans', 'Noto Sans SC', 'Noto Sans TC',
      -apple-system, BlinkMacSystemFont, sans-serif;
  }
  html:lang(zh-Hant) body {
    font-family:
      'Noto Sans', 'Noto Sans TC', 'Noto Sans SC',
      -apple-system, BlinkMacSystemFont, sans-serif;
  }
  html:lang(hi) body {
    font-family:
      'Noto Sans', 'Noto Sans Devanagari',
      -apple-system, BlinkMacSystemFont, sans-serif;
  }
  html:lang(ar) body {
    font-family:
      'Noto Sans', 'Noto Sans Arabic',
      -apple-system, BlinkMacSystemFont, sans-serif;
  }
```

> 동작 원리: `unicode-range`가 1차로 글자→폰트를 가르고, 한자처럼 영역이 겹치는 구간만 `font-family` 나열 순서(왼쪽 우선)가 2차로 결정한다. 일본어 페이지는 JP가 KR보다 앞 → 한자를 JP 자형으로. 한국어 페이지(기본 스택)는 KR이 JP/SC/TC보다 앞 → 한자가 와도 KR 자형(한국 한자).

- [ ] **Step 3: h1~h6 세리프 스택 교체**

기존 `h1...h6 { font-family: 'BookkMyungjo-Bd', serif; }`를 교체:

```css
  h1, h2, h3, h4, h5, h6 {
    @apply font-serif font-bold;
    /* 한국어 정체성 세리프. 비한글 제목은 Noto Sans 로 자연 폴백. */
    font-family: 'Noto Serif KR', 'Noto Sans', 'Noto Sans KR', serif;
    word-break: var(--text-word-break);
    overflow-wrap: break-word;
    hyphens: var(--text-hyphens);
    line-break: var(--text-line-break);
    scroll-margin-top: 5rem;
    text-wrap: balance;
  }
```

- [ ] **Step 4: 빌드로 CSS 유효성 확인**

Run:
```bash
pnpm build 2>&1 | tail -20
```
Expected: 빌드 성공(`✓ Compiled` / `Generating static pages`). PostCSS/Tailwind 파싱 에러 없어야 함.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat(fonts): @font-face unicode-range 분할 + lang 분기 폰트 스택"
```

---

## Task 5: Tailwind 시맨틱 토큰 교체

**Files:**
- Modify: `tailwind.config.js:15-29` (`fontFamily`)

**Interfaces:**
- Consumes: Task 4의 CSS family 이름
- Produces: Tailwind 유틸 `font-sans/serif/display/body/caption/partial`이 Noto 스택을 가리킴. 전 컴포넌트가 이 유틸을 이미 사용 중이라 컴포넌트 변경 불필요.

- [ ] **Step 1: `fontFamily` 블록 교체**

```js
      fontFamily: {
        // 본문/UI 산스 = Noto Sans 풀세트. 스크립트별 unicode-range 는
        // src/index.css @font-face 가 처리하므로 여기선 family 나열만.
        // CJK 한자 우선순위는 html:lang 분기(index.css)에서 제어.
        sans: [
          'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC',
          'Noto Sans TC', 'Noto Sans Devanagari', 'Noto Sans Arabic',
          ...require('tailwindcss/defaultTheme').fontFamily.sans,
        ],
        // 제목 세리프 = 한국어 정체성 한정(Noto Serif KR). 비한글은 산스 폴백.
        serif: ['Noto Serif KR', 'Noto Sans', 'Noto Sans KR', ...require('tailwindcss/defaultTheme').fontFamily.serif],
        display: ['Noto Serif KR', 'Noto Sans', 'Noto Sans KR', ...require('tailwindcss/defaultTheme').fontFamily.serif],
        // 포인트 폰트(유지). 비한글은 Noto Sans 폴백.
        partial: ['PartialSans', 'Noto Sans KR', 'Noto Sans', 'sans-serif'],
        body: [
          'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC',
          'Noto Sans TC', 'Noto Sans Devanagari', 'Noto Sans Arabic',
          ...require('tailwindcss/defaultTheme').fontFamily.sans,
        ],
        caption: [
          'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC',
          'Noto Sans TC', 'Noto Sans Devanagari', 'Noto Sans Arabic',
          ...require('tailwindcss/defaultTheme').fontFamily.sans,
        ],
      },
```

- [ ] **Step 2: 빌드 확인**

Run:
```bash
pnpm build 2>&1 | tail -10
```
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(fonts): tailwind 시맨틱 토큰을 Noto 스택으로 교체"
```

---

## Task 6: preload 교체 + PartialSans 범위 축소 (_document.tsx)

**Files:**
- Modify: `pages/_document.tsx:24-57` (폰트 preload 블록 3개)

**Interfaces:**
- Consumes: Task 2 산출물 woff2
- Produces: 전 페이지 공통 preload는 한글 본문(Noto Sans KR Regular)·제목(Noto Serif KR Bold)만. PartialSans·CJK·기타 언어 폰트는 preload하지 않음(해당 페이지에서 `font-display: swap`으로 자연 로드).

- [ ] **Step 1: preload 블록 교체**

기존 3개 preload(S-CoreDream/PartialSans/BookkMyungjo)를 아래로 교체한다. 전 페이지에 공통으로 등장하는 한글 본문·제목만 preload하고, PartialSans는 5곳 전용이므로 공통 preload에서 제거한다(리뷰 지적: 전 페이지 116KB high-priority 낭비).

```tsx
          {/* 본문 한글 preload — 모든 페이지 본문 기본 웨이트(Noto Sans KR 400).
              라틴/CJK/기타 스크립트는 해당 페이지에서 unicode-range 로 자연 로드. */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/NotoSansKR-Regular.subset.woff2?v=3"
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />

          {/* 제목 세리프 preload — 전 페이지 Navigation/h2(font-serif·display)에 즉시 사용.
              preload 없으면 Nav 에서 FOUT. */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/NotoSerifKR-Bold.subset.woff2?v=3"
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />
```

> PartialSans는 `gangjeong-story`(home/camps 2026) 전용이다. 필요하면 해당 페이지의 컴포넌트/getStaticProps 레벨에서 국소 preload하되, 1차 구현은 공통 preload 제거로 충분(`swap`이 FOUT를 방지). 비-KO 로케일은 NotoSansKR preload가 약간 불필요하지만, 라틴 본문은 `unicode-range`상 Noto Sans로 잡히므로 렌더 차단은 없다.

- [ ] **Step 2: 빌드 + 타입 확인**

Run:
```bash
pnpm build 2>&1 | tail -10
```
Expected: 성공, 타입 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add pages/_document.tsx
git commit -m "perf(fonts): preload 를 Noto 본문·제목으로 교체 + PartialSans 공통 preload 제거"
```

---

## Task 7: 구 폰트 자산 정리 + 시각 검증 + 최종 점검

**Files:**
- Delete: `public/fonts/{BookkMyungjo-Bd,S-CoreDream-*,}.subset.woff2` (Noto로 대체된 구 산출물)
- Verify: 전 로케일 렌더

**Interfaces:**
- Consumes: Task 1~6 전체

- [ ] **Step 1: 코드베이스에 구 폰트 이름 잔존 여부 확인**

Run:
```bash
grep -rnE "SCDream|S-CoreDream|BookkMyungjo|GmarketSans|kkubulim" src/ pages/ tailwind.config.js scripts/subset-fonts.py | grep -v "src/fonts/source"
```
Expected: **출력 없음**. 남아 있으면 해당 위치를 Noto 스택으로 교체 후 재커밋.

- [ ] **Step 2: 구 서브셋 산출물 삭제**

```bash
git rm public/fonts/BookkMyungjo-Bd.subset.woff2 \
       public/fonts/S-CoreDream-3Light.subset.woff2 \
       public/fonts/S-CoreDream-4Regular.subset.woff2 \
       public/fonts/S-CoreDream-5Medium.subset.woff2 \
       public/fonts/S-CoreDream-6Bold.subset.woff2 \
       public/fonts/S-CoreDream-7ExtraBold.subset.woff2
```

- [ ] **Step 3: 커버리지 검증 재실행**

Run:
```bash
pnpm fonts:verify
```
Expected: 모든 줄 `OK`, 종료코드 0.

- [ ] **Step 4: 전 로케일 시각 검증 (Playwright 스크린샷)**

dev 서버를 띄우고 문제 언어 4종을 스크린샷으로 확인한다.

```bash
pnpm dev &  # 또는 pnpm build && pnpm start
```

Playwright MCP로 각 로케일 홈을 열어 한자·데바나가리·아랍이 **시스템 폰트가 아니라 Noto로** 렌더되는지 육안 확인:
- `/zh-Hans` — 한자가 Noto Sans SC 자형(굵기·균형 일관)
- `/ja` — 가나와 한자가 같은 Noto Sans JP 톤(혼합 폴백 없음)
- `/hi` — 데바나가리가 Noto Sans Devanagari
- `/ar` — 아랍이 Noto Sans Arabic + RTL 유지
- `/` (ko) — 본문 Noto Sans KR, 제목 Noto Serif KR, gangjeong-story PartialSans

Expected: 네 언어 모두 글자별 폰트 불일치(가나≠한자 등)가 사라짐. 각 스크린샷을 육안 확인.

- [ ] **Step 5: CJK 서브셋 용량 재검토 (Task 2 Step 2 주석 후속)**

Run:
```bash
du -h public/fonts/NotoSans{JP,SC,TC}-*.subset.woff2 | sort -h
```
CJK 폰트가 페이지 성능을 해칠 만큼 크면(개별 >2MB) `scripts/subset-fonts.py`의 CJK floor(`U+4E00-9FFF` 전체)를 상용 한자표로 좁히고 `pnpm fonts:subset && pnpm fonts:verify` 재실행. 적정하면 그대로 둠. (판단·변경 시 `git commit -m "perf(fonts): CJK 서브셋 floor 상용 한자로 축소"`)

- [ ] **Step 6: prettier + 전체 빌드 최종 점검**

Run:
```bash
pnpm format:check && pnpm build 2>&1 | tail -15
```
Expected: format 통과, 빌드 성공. format 실패 시 `pnpm format` 후 재커밋.

- [ ] **Step 7: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "chore(fonts): 구 폰트 자산 정리 + 다국어 Noto 전환 마무리"
git push origin main
```

---

## Self-Review 체크리스트 (작성자 검토 완료)

- **본문 = Noto Sans 풀세트**: Task 1(수급)·2(서브셋)·4(@font-face)·5(tailwind) 커버. ✓
- **세리프 = Noto Serif KR 한국어 한정**: Task 4 h1~h6 스택 + Task 5 serif/display 토큰 + 비한글 산스 폴백. ✓
- **13 로케일 전부 커버(특히 CJK 한자·데바나가리·아랍)**: Task 1 Step 3 + Task 3 검증 + Task 7 Step 4 시각 검증. ✓
- **동적 콘텐츠(게시판) 누락 방지**: Task 2 Step 2 한글 완성형 + CJK 상용 floor. ✓
- **PartialSans preload 범위 축소**: Task 6. ✓
- **구 자산/이름 잔존 제거**: Task 7 Step 1~2. ✓
- **pnpm-lock/prettier 제약**: package.json만 변경(의존성 무변경) — lock 영향 없음 / Task 7 Step 6 format:check. ✓
- **타입 일관성**: family 이름(`Noto Sans KR` 등)이 Task 4 정의 → Task 5·6에서 동일 문자열 참조. ✓
