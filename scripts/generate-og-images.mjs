// 동적 콘텐츠(뮤지션·트랙·캠프·연대·작가)의 og:image webp 원본을
// 카카오톡·페이스북 호환 1200×630 jpg 파생본으로 미리 생성한다.
// src/utils/ogImage.ts 의 derivedOgPath 규칙과 반드시 동일해야 한다.
//
// 산출물:
//   - public/images/og/_derived/**.jpg   (빌드 산출물, .gitignore)
//   - src/generated/og-derived-manifest.json  (런타임 폴백 판정용, 커밋)
//
// 재인코딩 캐시:
//   sharp 재인코딩은 느리므로 이전 빌드 결과를 재사용한다. 내용 주소(content-addressed)
//   미러 .next/cache/og-derived/<hash>.jpg 를 두어, 원본 내용(+변환 파라미터) 해시가
//   같으면 인코딩을 건너뛰고 복사만 한다. Vercel 은 public/ 을 빌드 간 보존하지 않고
//   .next/cache 만 보존하므로 이 경로가 Vercel 빌드의 캐시가 된다(프레임워크가 자동
//   복원). CI 는 .github/workflows/ci.yml 이 actions/cache 로 이 미러(+public 산출물)를
//   매니페스트 해시 키로 복원한다. 스킵 판정을 내용 해시로 하는 이유: mtime 은
//   git 체크아웃·캐시 복원 시 값이 바뀌어 신뢰할 수 없다.
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { createHash } from 'crypto';
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

// 3) 변환 (내용 주소 캐시로 증분 인코딩)
const cacheDir = join(root, '.next', 'cache', 'og-derived');
mkdirSync(cacheDir, { recursive: true });

// 변환 파라미터가 바뀌면 모든 캐시가 무효화되도록 버전 태그를 해시에 섞는다.
const TRANSFORM_VERSION = 'v1:1200x630:cover:attention:jpeg-q82-mozjpeg';
const sourceKey = (srcFile) =>
  createHash('sha1').update(TRANSFORM_VERSION).update(readFileSync(srcFile)).digest('hex');

const manifest = [];
let made = 0; // sharp 로 새로 인코딩(캐시 미스)
let kept = 0; // 캐시 미러에서 복사(재인코딩 생략)
for (const src of [...sources].sort()) {
  const srcFile = join(pub, src.replace(/^\//, ''));
  if (!existsSync(srcFile)) {
    console.warn('  ! 원본 없음, 건너뜀:', src);
    continue;
  }
  const outFile = join(pub, derivedPath(src).replace(/^\//, ''));
  mkdirSync(dirname(outFile), { recursive: true });

  const cacheFile = join(cacheDir, sourceKey(srcFile) + '.jpg');
  if (existsSync(cacheFile)) {
    // 캐시 히트: 미러가 진실원천이므로 항상 public 으로 동기화한다(원본이 같은
    // 이름으로 A→B→A 교체된 경우에도 stale public 산출물을 덮어써 정합성 보장).
    copyFileSync(cacheFile, outFile);
    kept++;
  } else {
    // 캐시 미스: 인코딩 후 public 산출물 + 내용 주소 미러에 동시 기록.
    await sharp(srcFile)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outFile);
    copyFileSync(outFile, cacheFile);
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
console.log(
  `og 파생 이미지: 인코딩 ${made}, 캐시 ${kept}, 매니페스트 ${manifest.length}건 ` +
    `(미러: .next/cache/og-derived)`
);
