#!/usr/bin/env python3
"""Noto 폰트 원본을 google/fonts(가변폰트)에서 받아 정적 weight 를 추출한다.

산출: src/fonts/source/Noto*.ttf (gitignore — 서빙 안 되는 서브셋 입력).
이 파일들을 입력으로 scripts/subset-fonts.py 가 public/fonts/*.subset.woff2 를 만든다.

원본 ttf 는 총 100MB+ 라 레포에 커밋하지 않는다. 폰트를 갱신하거나
새 환경에서 서브셋을 재생성하려면:

    python3 scripts/fetch-noto-fonts.py
    pnpm fonts:subset
    pnpm fonts:verify

폰트는 모두 OFL 라이선스(google/fonts ofl/).
"""
from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "fonts" / "source"
GH = "https://github.com/google/fonts/raw/main/"

# (google/fonts 경로, 출력 베이스명, [(weight 라벨, wght 값), ...])
JOBS: list[tuple[str, str, list[tuple[str, int]]]] = [
    ("ofl/notosans/NotoSans[wdth,wght].ttf", "NotoSans",
     [("Regular", 400), ("Medium", 500), ("Bold", 700)]),
    ("ofl/notosanskr/NotoSansKR[wght].ttf", "NotoSansKR",
     [("Light", 300), ("Regular", 400), ("Medium", 500), ("SemiBold", 600), ("Bold", 700)]),
    ("ofl/notosansjp/NotoSansJP[wght].ttf", "NotoSansJP",
     [("Regular", 400), ("Bold", 700)]),
    ("ofl/notosanssc/NotoSansSC[wght].ttf", "NotoSansSC",
     [("Regular", 400), ("Bold", 700)]),
    ("ofl/notosanstc/NotoSansTC[wght].ttf", "NotoSansTC",
     [("Regular", 400), ("Bold", 700)]),
    ("ofl/notosansdevanagari/NotoSansDevanagari[wdth,wght].ttf", "NotoSansDevanagari",
     [("Regular", 400), ("Bold", 700)]),
    ("ofl/notosansarabic/NotoSansArabic[wdth,wght].ttf", "NotoSansArabic",
     [("Regular", 400), ("Bold", 700)]),
    ("ofl/notoserifkr/NotoSerifKR[wght].ttf", "NotoSerifKR",
     [("Bold", 700)]),
]


def _url(path: str) -> str:
    return GH + path.replace("[", "%5B").replace("]", "%5D").replace(",", "%2C")


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    cache: dict[str, bytes] = {}

    for gh_path, out_base, weights in JOBS:
        url = _url(gh_path)
        print(f"다운로드 {out_base} VF …", file=sys.stderr)
        with urllib.request.urlopen(url) as resp:  # noqa: S310 (신뢰된 google/fonts)
            vf_bytes = resp.read()
        cache[out_base] = vf_bytes

        # 가변축 파악 (wdth 존재 시 표준 폭 100 으로 고정)
        import io
        axes = {a.axisTag for a in TTFont(io.BytesIO(vf_bytes))["fvar"].axes}

        for label, wght in weights:
            font = TTFont(io.BytesIO(vf_bytes))
            loc = {"wght": wght}
            if "wdth" in axes:
                loc["wdth"] = 100
            instantiateVariableFont(font, loc, inplace=True)
            out = OUT / f"{out_base}-{label}.ttf"
            font.save(str(out))
        print(f"  → {out_base}: {len(weights)} weights", file=sys.stderr)

    print("\n=== src/fonts/source/Noto*.ttf ===", file=sys.stderr)
    total = 0
    for f in sorted(OUT.glob("Noto*.ttf")):
        kb = f.stat().st_size // 1024
        total += kb
        print(f"  {f.name:34} {kb:>6} KB", file=sys.stderr)
    print(f"  {'TOTAL':34} {total:>6} KB", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
