/**
 * 이미지 최적화 스크립트
 *
 * 500KB 이상의 이미지를 리사이징하고 압축합니다.
 *
 * 사용법: node scripts/optimize-images.js
 *
 * 주의: 원본 이미지를 덮어씁니다. 백업 먼저 권장.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  // 최대 이미지 너비 (픽셀)
  MAX_WIDTH: 1920,
  // 최대 이미지 높이 (픽셀)
  MAX_HEIGHT: 1080,
  // WebP 압축 품질 (0-100)
  QUALITY: 80,
  // 최적화 대상 최소 파일 크기 (바이트)
  MIN_SIZE_BYTES: 500 * 1024, // 500KB
  // 이미지 디렉토리
  IMAGE_DIR: path.join(__dirname, '../public/images-webp'),
};

let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;
let savedBytes = 0;

async function optimizeImage(filePath) {
  try {
    const stats = fs.statSync(filePath);

    // 500KB 미만이면 스킵
    if (stats.size < CONFIG.MIN_SIZE_BYTES) {
      skippedCount++;
      return;
    }

    const originalSize = stats.size;

    // 이미지 메타데이터 확인
    const metadata = await sharp(filePath).metadata();

    // 리사이징 및 압축
    const optimized = await sharp(filePath)
      .resize(CONFIG.MAX_WIDTH, CONFIG.MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: CONFIG.QUALITY })
      .toBuffer();

    // 새 파일이 더 작은 경우에만 저장
    if (optimized.length < originalSize) {
      fs.writeFileSync(filePath, optimized);
      const saved = originalSize - optimized.length;
      savedBytes += saved;
      processedCount++;
      console.log(
        `✅ ${path.basename(filePath)}: ${formatBytes(originalSize)} → ${formatBytes(optimized.length)} (${formatBytes(saved)} 절약)`
      );
    } else {
      skippedCount++;
      console.log(`⏭️ ${path.basename(filePath)}: 이미 최적화됨`);
    }
  } catch (error) {
    errorCount++;
    console.error(`❌ ${path.basename(filePath)}: ${error.message}`);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await walkDir(filePath);
    } else if (file.endsWith('.webp')) {
      await optimizeImage(filePath);
    }
  }
}

async function main() {
  console.log('🖼️ 이미지 최적화 시작...\n');
  console.log(`설정:`);
  console.log(`  - 최대 크기: ${CONFIG.MAX_WIDTH}x${CONFIG.MAX_HEIGHT}`);
  console.log(`  - 품질: ${CONFIG.QUALITY}%`);
  console.log(`  - 대상: ${formatBytes(CONFIG.MIN_SIZE_BYTES)} 이상의 파일\n`);

  if (!fs.existsSync(CONFIG.IMAGE_DIR)) {
    console.error(`❌ 디렉토리를 찾을 수 없습니다: ${CONFIG.IMAGE_DIR}`);
    process.exit(1);
  }

  await walkDir(CONFIG.IMAGE_DIR);

  console.log('\n📊 결과:');
  console.log(`  처리됨: ${processedCount}개`);
  console.log(`  스킵됨: ${skippedCount}개`);
  console.log(`  오류: ${errorCount}개`);
  console.log(`  총 절약: ${formatBytes(savedBytes)}`);
}

main().catch(console.error);
