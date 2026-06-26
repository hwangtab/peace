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
