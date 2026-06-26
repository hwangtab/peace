// 캠프 포스터 표시용 축소본 생성
//
// 포스터 원본(5400×7200, ~2.7MB webp)은 홍보 키트(/camps/2026/promote)에서
// 뮤지션이 SNS 공유용으로 다운로드하므로 고해상도로 보존한다. 반면 메인 캠프
// 페이지(Camp2026Page)의 360px 슬롯 표시에 원본을 쓰면 Next/Image 최적화 서버가
// 매 변환마다 5400px를 디코드해야 해 메모리·CPU 비용이 크다. 표시용 1440px 축소본을
// 별도로 만들어 변환 입력을 줄인다(원본 대비 ~82% 감소).
//
// 포스터 교체 시 재실행: node scripts/generate-poster-display.mjs
import sharp from 'sharp';

const JOBS = [
  {
    src: 'public/images-webp/camps/2026/2026poster1.webp',
    out: 'public/images-webp/camps/2026/2026poster1-display.webp',
  },
];

for (const { src, out } of JOBS) {
  const info = await sharp(src)
    .resize(1440, 1920, { fit: 'inside' })
    .webp({ quality: 80 })
    .toFile(out);
  console.log(`생성: ${out} (${info.width}x${info.height})`);
}
