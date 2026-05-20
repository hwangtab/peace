#!/usr/bin/env bash
# MP3 320kbps → 128kbps CBR 재인코딩 스크립트
# 실행: bash scripts/optimize-audio.sh
# 원본은 ~/peace-audio-backup-320k/ 에 백업됩니다.
set -euo pipefail

AUDIO_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/audio"
BACKUP_DIR="$HOME/peace-audio-backup-320k"

echo "=== peaceandmusic.net MP3 재인코딩 (320kbps → 128kbps) ==="
echo "대상 디렉토리: $AUDIO_DIR"
echo "원본 백업:     $BACKUP_DIR"
echo ""

if [ ! -d "$AUDIO_DIR" ]; then
  echo "ERROR: public/audio 디렉토리를 찾을 수 없습니다: $AUDIO_DIR"
  exit 1
fi

# 1. 원본 백업
echo "[1/3] 원본 파일 백업 중..."
mkdir -p "$BACKUP_DIR"
for f in "$AUDIO_DIR"/*.mp3; do
  base="$(basename "$f")"
  if [ -f "$BACKUP_DIR/$base" ]; then
    echo "  $base — 이미 백업됨, 건너뜀"
  else
    cp "$f" "$BACKUP_DIR/$base"
    echo "  $base → $BACKUP_DIR/$base"
  fi
done
echo "  백업 완료"
echo ""

# 2. 재인코딩
echo "[2/3] 128kbps CBR 재인코딩 중..."
TOTAL=0
OK=0
for f in "$AUDIO_DIR"/*.mp3; do
  base="$(basename "$f")"
  tmp="${f%.mp3}_128k_tmp.mp3"
  TOTAL=$((TOTAL + 1))

  ffmpeg -y -i "$f" -b:a 128k -map_metadata 0 "$tmp" -loglevel error
  mv "$tmp" "$f"
  echo "  ✓ $base"
  OK=$((OK + 1))
done
echo "  재인코딩 완료: $OK/$TOTAL 파일"
echo ""

# 3. 검증
echo "[3/3] 검증 (비트레이트·파일크기)..."
TOTAL_AFTER=0
for f in "$AUDIO_DIR"/*.mp3; do
  base="$(basename "$f")"
  bitrate="$(ffprobe -v error -show_entries format=bit_rate -of csv=p=0 "$f" 2>/dev/null)"
  size_kb="$(du -k "$f" | awk '{print $1}')"
  TOTAL_AFTER=$((TOTAL_AFTER + size_kb))
  printf "  %-12s  %d kbps  %d KB\n" "$base" "$((bitrate / 1000))" "$size_kb"
done
echo ""
echo "재인코딩 후 합계: $((TOTAL_AFTER / 1024)) MB"
echo ""

before_mb="$(du -sh "$BACKUP_DIR" | awk '{print $1}')"
echo "원본 백업($BACKUP_DIR): $before_mb"
echo "=== 완료 ==="
