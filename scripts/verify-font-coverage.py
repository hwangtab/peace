#!/usr/bin/env python3
"""서브셋 산출물이 각 스크립트의 대표 글자를 담는지 검증한다.

폰트 교체·서브셋 floor 변경 후 회귀(특정 언어 글리프 누락) 방지용.
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont

FONT_DIR = Path(__file__).resolve().parent.parent / "public" / "fonts"

# (서브셋 파일명, 대표 코드포인트, 라벨)
#
# 0xB766("뮁", 확장음절) 케이스는 Design B 전환(코어 웹폰트 + 시스템 폴백)으로
# 의도적으로 제외됐다 — NotoSansKR/NotoSerifKR 는 완성형 11,172자 전체가 아니라
# 실사용 935자 + KS X 1001 상용 2,350자만 담고, 코어 밖 희귀 음절은 CSS
# unicode-range 밖이라 시스템 한글 폰트로 자연 폴백된다(깨짐 아님). 대신 상용
# 음절 커버리지를 아래 케이스로 확인한다.
CASES = [
    ("NotoSansKR-Regular.subset.woff2", 0xAC00, "한글 가"),
    ("NotoSansKR-Regular.subset.woff2", 0xAC15, "상용 음절 강"),
    ("NotoSansKR-Regular.subset.woff2", 0xC815, "상용 음절 정"),
    ("NotoSansKR-Regular.subset.woff2", 0xD654, "상용 음절 화"),
    ("NotoSansJP-Regular.subset.woff2", 0x4E2D, "한자 中"),
    ("NotoSansJP-Regular.subset.woff2", 0x3042, "가나 あ"),
    ("NotoSansSC-Regular.subset.woff2", 0x4E2D, "간체 中"),
    ("NotoSansTC-Regular.subset.woff2", 0x4E2D, "번체 中"),
    ("NotoSansDevanagari-Regular.subset.woff2", 0x0915, "데바나가리 क"),
    ("NotoSansArabic-Regular.subset.woff2", 0x0628, "아랍 ب"),
    ("NotoSans-Regular.subset.woff2", 0x0410, "키릴 А"),
    ("NotoSans-Regular.subset.woff2", 0x0041, "라틴 A"),
    ("NotoSerifKR-Bold.subset.woff2", 0xAC00, "세리프 한글 가"),
    # 세리프 2-슬라이스(core/rest) — core=공개 페이지 실사용 글리프, rest=잔여 상용
    # 음절. 브라우저가 unicode-range 로 페이지에 맞는 슬라이스만 로드한다. 아래
    # core 케이스는 공개 페이지가 세리프(typo-h2/h3)로 렌더하는 대표 글자가 실제로
    # core 슬라이스에 담겼는지 확인한다(수집 소스 누락 회귀 방지). rest 슬라이스와
    # core 의 cmap 합집합이 기존 단일 서브셋과 동일한지는 main() 이 별도 검증한다.
    ("NotoSerifKR-Bold.core.woff2", 0xD654, "core 화(홈 h2 '평화'·제목 공통)"),
    ("NotoSerifKR-Bold.core.woff2", 0xD3C9, "core 평(press 제목 '평화')"),
    ("NotoSerifKR-Bold.core.woff2", 0xB178, "core 노(홈/제목 '노래')"),
    ("NotoSerifKR-Bold.core.woff2", 0xB798, "core 래(홈/제목 '노래')"),
    ("NotoSerifKR-Bold.core.woff2", 0xAE40, "core 김(video 제목 '김동산')"),
    ("NotoSerifKR-Bold.core.woff2", 0xBE14, "core 블(video 제목 '블루이웃')"),
    # 세리프 라틴/숫자(A, 2026 등)는 NotoSerifKR 서브셋에서 의도적으로 제외한다.
    # 세리프 @font-face 의 unicode-range 는 한글·자모·구두점만 선언하므로 라틴은
    # 애초에 이 폰트로 렌더되지 않고, 제목 세리프 스택의 다음 폰트(Noto Sans)가
    # 서빙한다(src/index.css·tailwind.config.js 'serif' 스택 참조). 파일에 라틴
    # 글리프를 담아 두는 건 다운로드만 되고 안 쓰이는 낭비라 빼는 게 맞다.
    #
    # PartialSans(포인트 폰트) — collect_partial_chars() 로 font-partial 실사용
    # 텍스트(locale JSON 전체 + musicians/tracks)만 담는 초경량 서브셋이다. 한글코어
    # (KS X 1001) floor 를 두지 않으므로, font-partial 로 렌더되는 대표 제목 글자와
    # 라틴/숫자 floor 가 실제로 담겼는지 확인해 서브셋 정책 회귀(수집 소스 누락 등)를
    # 잡는다. 게시판 등 동적 텍스트의 미수록 음절은 Noto Sans KR 로 정상 폴백되므로
    # (tofu 아님) 검증 대상이 아니다.
    ("PartialSansKR-Regular.subset.woff2", 0xAC15, "포인트 강(home.hero.title)"),
    ("PartialSansKR-Regular.subset.woff2", 0xC815, "포인트 정(home.hero.title)"),
    ("PartialSansKR-Regular.subset.woff2", 0xC804, "포인트 전(gangjeong hook_headline)"),
    ("PartialSansKR-Regular.subset.woff2", 0xB144, "포인트 년(ImpactNumbers suffix)"),
    ("PartialSansKR-Regular.subset.woff2", 0x0030, "포인트 숫자 0(ImpactNumbers)"),
]


def _cmap_codepoints(fn: str) -> set[int]:
    return set(TTFont(str(FONT_DIR / fn)).getBestCmap().keys())


def verify_serif_slice_union() -> bool:
    """세리프 core ∪ rest 의 cmap 이 기존 단일 서브셋(.subset)과 동일한지 검증.

    2-슬라이스 분할이 커버리지를 한 글자도 잃지 않았음을 보장한다. core 는 공개
    실사용 + 자모 + 구두점, rest 는 나머지 상용 음절 — 둘의 합집합이 분할 전
    NotoSerifKR-Bold.subset.woff2 와 정확히 일치해야 한다. 또한 두 슬라이스가
    한글 음절 영역에서 서로 겹치지 않는지(불필요한 중복 임베드)도 함께 본다.
    """
    core = FONT_DIR / "NotoSerifKR-Bold.core.woff2"
    rest = FONT_DIR / "NotoSerifKR-Bold.rest.woff2"
    subset = FONT_DIR / "NotoSerifKR-Bold.subset.woff2"
    for p in (core, rest, subset):
        if not p.exists():
            print(f"FAIL  세리프 슬라이스 {p.name} 없음")
            return False

    core_cps = _cmap_codepoints(core.name)
    rest_cps = _cmap_codepoints(rest.name)
    subset_cps = _cmap_codepoints(subset.name)
    union = core_cps | rest_cps

    ok = True
    if union == subset_cps:
        print(f"OK    세리프 core∪rest == subset ({len(subset_cps)} codepoints)")
    else:
        ok = False
        missing = subset_cps - union
        extra = union - subset_cps
        print(
            f"FAIL  세리프 core∪rest != subset "
            f"(subset={len(subset_cps)}, union={len(union)}, "
            f"누락={len(missing)}, 초과={len(extra)})"
        )
        if missing:
            print("      누락 예: " + " ".join(f"U+{c:04X}" for c in sorted(missing)[:20]))

    # 한글 음절 영역 중복(있어도 렌더는 정상이나 용량 낭비 → 경고).
    hangul_overlap = {c for c in (core_cps & rest_cps) if 0xAC00 <= c <= 0xD7A3}
    if hangul_overlap:
        print(f"WARN  core/rest 한글 음절 {len(hangul_overlap)}자 중복 임베드")
    else:
        print("OK    세리프 core/rest 한글 음절 중복 없음")

    return ok


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

    ok = verify_serif_slice_union() and ok

    if not ok:
        print("\n커버리지 검증 실패 — 서브셋 floor/원본 폰트를 확인하세요.", file=sys.stderr)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
