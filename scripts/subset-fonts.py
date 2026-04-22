#!/usr/bin/env python3
"""Subset /public/fonts to characters actually used in the project.

입력 소스:
- public/locales/**/translation.json (14 언어)
- public/data/**/*.json (뮤지션/트랙/갤러리/비디오 등 콘텐츠)
- src/**/*.{ts,tsx,js} (하드코딩 문자열까지 포함, 과하게 안전측)

출력: public/fonts/*.subset.woff2 (WOFF2 기본, S-CoreDream은 woff 유지)
폰트 이름은 유지하고, CSS @font-face 에서 경로만 *.subset.woff2 로 교체.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "public" / "fonts"
LOCALE_DIR = ROOT / "public" / "locales"
DATA_DIR = ROOT / "public" / "data"
SRC_DIR = ROOT / "src"


def collect_text_chars() -> set[str]:
    chars: set[str] = set()

    for path in LOCALE_DIR.rglob("translation.json"):
        with path.open(encoding="utf-8") as f:
            chars.update(_chars_from_value(json.load(f)))

    if DATA_DIR.exists():
        for path in DATA_DIR.rglob("*.json"):
            try:
                with path.open(encoding="utf-8") as f:
                    chars.update(_chars_from_value(json.load(f)))
            except Exception:
                continue

    for ext in ("*.ts", "*.tsx", "*.js", "*.jsx"):
        for path in SRC_DIR.rglob(ext):
            try:
                chars.update(path.read_text(encoding="utf-8"))
            except Exception:
                continue

    # 페이지 디렉토리 문자열도 포함
    for ext in ("*.ts", "*.tsx"):
        for path in (ROOT / "pages").rglob(ext):
            try:
                chars.update(path.read_text(encoding="utf-8"))
            except Exception:
                continue

    return chars


def _chars_from_value(value) -> set[str]:
    out: set[str] = set()
    if isinstance(value, str):
        out.update(value)
    elif isinstance(value, dict):
        for v in value.values():
            out.update(_chars_from_value(v))
    elif isinstance(value, list):
        for v in value:
            out.update(_chars_from_value(v))
    return out


def build_safety_floor() -> set[str]:
    """폰트가 반드시 유지해야 하는 안전 글자 집합."""
    out: set[str] = set()
    # Basic Latin (printable)
    out.update(chr(c) for c in range(0x20, 0x7F))
    # Latin-1 Supplement (악센트 포함)
    out.update(chr(c) for c in range(0xA0, 0x100))
    # General punctuation (― … • 등)
    out.update(chr(c) for c in range(0x2000, 0x206F))
    # Common symbols (copyright, registered, trademark 등)
    out.update(["©", "®", "™", "·", "—", "–", "…", "·", "「", "」", "『", "』"])
    # Currency
    out.update("$€¥₩£")
    # Zero-width + soft-hyphen (한글 줄바꿈에 필요할 수 있음)
    out.update(["​", "­"])
    return out


def to_unicode_list(chars: set[str]) -> list[int]:
    codepoints = set()
    for ch in chars:
        if not ch:
            continue
        cp = ord(ch)
        # 제어문자 제외 (탭/개행은 허용)
        if cp < 0x20 and ch not in ("\t", "\n", "\r"):
            continue
        codepoints.add(cp)
    return sorted(codepoints)


def subset_font(src: Path, dst: Path, unicode_list: list[int], fmt: str) -> tuple[int, int]:
    unicode_arg = ",".join(f"U+{cp:04X}" for cp in unicode_list)
    cmd = [
        "pyftsubset",
        str(src),
        f"--output-file={dst}",
        f"--unicodes={unicode_arg}",
        f"--flavor={fmt}",
        "--layout-features=*",
        "--glyph-names",
        "--symbol-cmap",
        "--legacy-cmap",
        "--notdef-glyph",
        "--notdef-outline",
        "--recommended-glyphs",
        "--name-legacy",
        "--drop-tables=",
        "--name-IDs=*",
        "--name-languages=*",
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)
    return src.stat().st_size, dst.stat().st_size


FONTS: list[tuple[str, str, str]] = [
    # (src filename, dst filename, flavor)
    ("GmarketSansLight.woff2", "GmarketSansLight.subset.woff2", "woff2"),
    ("GmarketSansMedium.woff2", "GmarketSansMedium.subset.woff2", "woff2"),
    ("GmarketSansBold.woff2", "GmarketSansBold.subset.woff2", "woff2"),
    ("PartialSansKR-Regular.woff2", "PartialSansKR-Regular.subset.woff2", "woff2"),
    ("BookkMyungjo-Bd.woff2", "BookkMyungjo-Bd.subset.woff2", "woff2"),
    ("BMkkubulim-Regular.woff2", "BMkkubulim-Regular.subset.woff2", "woff2"),
    ("S-CoreDream-3Light.woff", "S-CoreDream-3Light.subset.woff2", "woff2"),
]


def main() -> int:
    chars = collect_text_chars() | build_safety_floor()
    unicodes = to_unicode_list(chars)
    print(f"Collected {len(unicodes)} unique codepoints", file=sys.stderr)

    total_before = 0
    total_after = 0
    for src_name, dst_name, flavor in FONTS:
        src = FONT_DIR / src_name
        dst = FONT_DIR / dst_name
        if not src.exists():
            print(f"  SKIP {src_name} (missing)", file=sys.stderr)
            continue
        try:
            before, after = subset_font(src, dst, unicodes, flavor)
        except subprocess.CalledProcessError as exc:
            print(f"  FAIL {src_name}: {exc.stderr[:300]}", file=sys.stderr)
            return 1
        total_before += before
        total_after += after
        pct = (1 - after / before) * 100 if before else 0
        print(f"  {src_name}: {before/1024:,.0f} KB -> {after/1024:,.0f} KB (-{pct:.0f}%)", file=sys.stderr)

    print(
        f"Total: {total_before/1024:,.0f} KB -> {total_after/1024:,.0f} KB "
        f"(-{(1-total_after/total_before)*100:.0f}%)",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
