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
FONT_SOURCE_DIR = ROOT / "src" / "fonts" / "source"  # 원본 폰트 (비공개, 서빙 안 됨)
FONT_DIR = ROOT / "public" / "fonts"  # subset 출력 (서빙됨)
LOCALE_DIR = ROOT / "public" / "locales"
DATA_DIR = ROOT / "public" / "data"
SRC_DIR = ROOT / "src"


def collect_text_chars() -> set[str]:
    chars: set[str] = set()

    # 모든 로케일 네임스페이스 JSON (translation.json + camp_guidelines_2026.json 등).
    # translation.json 만 읽으면 다른 네임스페이스 전용 글자(예: 휠·컵)가 서브셋에서 누락됨.
    for path in LOCALE_DIR.rglob("*.json"):
        try:
            with path.open(encoding="utf-8") as f:
                chars.update(_chars_from_value(json.load(f)))
        except Exception:
            continue

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
    # --- 동적 콘텐츠(게시판·댓글·회원명) 대비 안전집합 ---
    # 한글: 완성형 음절 전체(AC00–D7A3). 자모 조합형이라 글리프 수 대비
    # woff2 증가폭이 제한적이고, 사용자 입력 한글 누락을 원천 차단한다.
    out.update(chr(c) for c in range(0xAC00, 0xD7A3 + 1))
    # CJK: 상용 한자 floor — 한·중·일 입력 대비. CJK Unified 전체는 과중하므로
    # 통상 상용역(기본 한자 + 확장 일부)만. (zh/ja 로케일 콘텐츠는 collect 단계에서
    # 이미 포함되며, 여기 floor 는 동적 입력 누락 방지용 보강.)
    out.update(chr(c) for c in range(0x4E00, 0x9FFF + 1))  # CJK Unified Ideographs
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
    strip_empty_glyph_cmaps(dst, fmt)
    return src.stat().st_size, dst.stat().st_size


def strip_empty_glyph_cmaps(path: Path, fmt: str) -> int:
    """cmap 에 매핑돼 있지만 실제 outline 이 빈 한글 글리프를, cmap 에서 제거한다.

    일부 폰트(예: S-Core Dream)는 '뮁'·'읭' 같은 확장 완성형 음절을 cmap 에는
    등록해 두고도 글리프 outline 은 비워 둔다. 이러면 브라우저는 그 폰트에서
    글자를 '찾았다'고 판단해 폴백을 멈추고 빈 칸을 그린다(폰트 스택 뒤의
    한글 폰트로 못 넘어감). cmap 매핑을 지우면 브라우저가 폴백을 이어가
    뒤쪽 폰트(BookkMyungjo 등)가 정상 렌더한다.
    """
    from fontTools.ttLib import TTFont
    from fontTools.pens.recordingPen import RecordingPen

    font = TTFont(str(path))
    glyph_set = font.getGlyphSet()

    empty: set[str] = set()
    for gname in font.getGlyphOrder():
        pen = RecordingPen()
        try:
            glyph_set[gname].draw(pen)
        except Exception:
            continue
        if not pen.value:
            empty.add(gname)

    removed = 0
    removed_chars: set[str] = set()
    for table in font["cmap"].tables:
        for cp in list(table.cmap.keys()):
            # 한글 음절 영역(AC00–D7A3)만 대상 — space 등 의도적 빈 글리프 보호
            if 0xAC00 <= cp <= 0xD7A3 and table.cmap[cp] in empty:
                del table.cmap[cp]
                removed_chars.add(chr(cp))
                removed += 1

    if removed:
        font.flavor = fmt
        font.save(str(path))
        print(
            f"    cmap 정리: 빈 한글 글리프 {len(removed_chars)}자 폴백 처리 "
            f"({' '.join(sorted(removed_chars))})",
            file=sys.stderr,
        )
    return removed


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
    ("PartialSansKR-Regular.woff2", "PartialSansKR-Regular.subset.woff2", "woff2"),
]


def main() -> int:
    chars = collect_text_chars() | build_safety_floor()
    unicodes = to_unicode_list(chars)
    print(f"Collected {len(unicodes)} unique codepoints", file=sys.stderr)

    total_before = 0
    total_after = 0
    for src_name, dst_name, flavor in FONTS:
        src = FONT_SOURCE_DIR / src_name
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
