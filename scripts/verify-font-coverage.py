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
    # 세리프 라틴/숫자(A, 2026 등)는 NotoSerifKR 서브셋에서 의도적으로 제외한다.
    # 세리프 @font-face 의 unicode-range 는 한글·자모·구두점만 선언하므로 라틴은
    # 애초에 이 폰트로 렌더되지 않고, 제목 세리프 스택의 다음 폰트(Noto Sans)가
    # 서빙한다(src/index.css·tailwind.config.js 'serif' 스택 참조). 파일에 라틴
    # 글리프를 담아 두는 건 다운로드만 되고 안 쓰이는 낭비라 빼는 게 맞다.
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
