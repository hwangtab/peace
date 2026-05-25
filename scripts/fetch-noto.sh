#!/usr/bin/env bash
# Noto Sans 다국어 가변폰트 원본을 src/fonts/source/noto/ 로 받는다.
# 이 원본들은 대용량이라 gitignore 됨. 받은 뒤 `npm run fonts:subset` 으로
# 실제 쓰는 글자만 서브셋해 public/fonts/*.subset.woff2 (커밋 대상)를 생성한다.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="src/fonts/source/noto"
mkdir -p "$DEST"
BASE="https://github.com/google/fonts/raw/main/ofl"

# (ofl 디렉토리, 출력 basename, 가변폰트 파일명 패턴)
dl() {
  local dir="$1" base="$2" fname="$3"
  echo "↓ $base"
  curl -fsSL --max-time 300 -o "$DEST/$base-VF.ttf" "$BASE/$dir/$fname.ttf"
}

dl notosans            NotoSans            "NotoSans%5Bwdth,wght%5D"
dl notosanskr          NotoSansKR          "NotoSansKR%5Bwght%5D"
dl notosansarabic      NotoSansArabic      "NotoSansArabic%5Bwdth,wght%5D"
dl notosansdevanagari  NotoSansDevanagari  "NotoSansDevanagari%5Bwdth,wght%5D"
dl notosansjp          NotoSansJP          "NotoSansJP%5Bwght%5D"
dl notosanssc          NotoSansSC          "NotoSansSC%5Bwght%5D"
dl notosanstc          NotoSansTC          "NotoSansTC%5Bwght%5D"

echo "완료. 다음: npm run fonts:subset"
