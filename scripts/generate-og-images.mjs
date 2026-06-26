// 동적 콘텐츠(뮤지션·트랙·캠프·연대·작가)의 og:image webp 원본을
// 카카오톡·페이스북 호환 1200×630 jpg 파생본으로 미리 생성한다.
// src/utils/ogImage.ts 의 derivedOgPath 규칙과 반드시 동일해야 한다.
//
// 산출물:
//   - public/images/og/_derived/**.jpg   (빌드 산출물, .gitignore)
//   - src/generated/og-derived-manifest.json  (런타임 폴백 판정용, 커밋)
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const isImg = (u) => typeof u === 'string' && /\.(webp|avif)$/i.test(u);
const derivedPath = (src) => {
  const rel = src.replace(/^\/?(images-webp|images)\//, '');
  return '/images/og/_derived/' + rel.replace(/\.(webp|avif)$/i, '.jpg');
};

const sources = new Set();

// 1) 뮤지션·트랙 (정적 json, ko 기준 — 로케일별 imageUrl 동일)
for (const f of ['data/musicians.json', 'data/tracks.json']) {
  const raw = JSON.parse(readFileSync(join(pub, f), 'utf8'));
  const list = Array.isArray(raw) ? raw : Object.values(raw)[0];
  for (const it of list) if (isImg(it?.imageUrl)) sources.add(it.imageUrl);
}

// 2) 캠프 대표 이미지(images[0]), 연대 poster, 작가 프로필 image (정적 ts)
const grab = (file, re) => {
  const txt = readFileSync(join(root, file), 'utf8');
  for (const m of txt.matchAll(re)) sources.add(m[1]);
};
grab('src/data/camps.ts', /images:\s*\[\s*['"]([^'"]+\.(?:webp|avif))['"]/gi);
grab('src/data/solidarity.ts', /poster:\s*['"]([^'"]+\.(?:webp|avif))['"]/gi);
grab('src/data/photographers.ts', /image:\s*['"]([^'"]+\.(?:webp|avif))['"]/gi);

// 3) 변환
const manifest = [];
let made = 0;
let kept = 0;
for (const src of [...sources].sort()) {
  const srcFile = join(pub, src.replace(/^\//, ''));
  if (!existsSync(srcFile)) {
    console.warn('  ! 원본 없음, 건너뜀:', src);
    continue;
  }
  const outFile = join(pub, derivedPath(src).replace(/^\//, ''));
  mkdirSync(dirname(outFile), { recursive: true });
  if (existsSync(outFile)) {
    kept++;
  } else {
    await sharp(srcFile)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outFile);
    made++;
  }
  manifest.push(src);
}

const genDir = join(root, 'src/generated');
mkdirSync(genDir, { recursive: true });
writeFileSync(
  join(genDir, 'og-derived-manifest.json'),
  JSON.stringify(manifest.sort(), null, 2) + '\n'
);
console.log(`og 파생 이미지: 생성 ${made}, 기존 ${kept}, 매니페스트 ${manifest.length}건`);
