/**
 * Generate Gangjeong story section images
 * Output: 1080px wide PNG images
 * Usage: node scripts/generate-story-images.js
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const W = 1080;
const OUT = path.join(__dirname, '..', 'output', 'gangjeong-story');
const FD = path.join(__dirname, '..', 'public', 'fonts');
const IMG = path.join(__dirname, '..', 'public');

// ── Helpers ──
function fontB64(file) {
  return fs.readFileSync(path.join(FD, file)).toString('base64');
}
function imgB64(relPath) {
  return 'data:image/webp;base64,' + fs.readFileSync(path.join(IMG, relPath)).toString('base64');
}

// ── Load assets ──
const fonts = {
  gmsB: fontB64('GmarketSansBold.woff2'),
  gmsM: fontB64('GmarketSansMedium.woff2'),
  gmsL: fontB64('GmarketSansLight.woff2'),
  partial: fontB64('PartialSansKR-Regular.woff2'),
  bookk: fontB64('BookkMyungjo-Bd.woff2'),
  scd: fontB64('S-CoreDream-3Light.woff'),
};

const images = {
  hook: imgB64('images-webp/camps/2023/20230610밤 전쟁을끝내자.webp'),
  story1: imgB64('images-webp/gangjeong/gurumbi-prayer.webp'),
  story2: imgB64('images-webp/gangjeong/gangjeong-memory.webp'),
  story3: imgB64('images-webp/camps/2023/20230610밤 우와악.webp'),
};

// ── Font faces ──
const fontFaces = `
@font-face { font-family: 'GMS'; src: url('data:font/woff2;base64,${fonts.gmsB}') format('woff2'); font-weight: 700; }
@font-face { font-family: 'GMS'; src: url('data:font/woff2;base64,${fonts.gmsM}') format('woff2'); font-weight: 500; }
@font-face { font-family: 'GMS'; src: url('data:font/woff2;base64,${fonts.gmsL}') format('woff2'); font-weight: 200; }
@font-face { font-family: 'PS'; src: url('data:font/woff2;base64,${fonts.partial}') format('woff2'); font-weight: 400; }
@font-face { font-family: 'BK'; src: url('data:font/woff2;base64,${fonts.bookk}') format('woff2'); font-weight: 700; }
@font-face { font-family: 'SCD'; src: url('data:font/woff;base64,${fonts.scd}') format('woff'); font-weight: 300; }
`;

const baseCSS = `${fontFaces}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: ${W}px; font-family: 'GMS', sans-serif; overflow: hidden; }
`;

// ── Story block template ──
function storyBlockHtml(bgDataUri, text) {
  return `<style>${baseCSS}
    .wrap { position: relative; width: ${W}px; height: 810px; display: flex; align-items: flex-end; }
    .bg { position: absolute; inset: 0; background: url('${bgDataUri}') center/cover; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.3), transparent); }
    .content { position: relative; z-index: 1; padding: 0 60px 64px; max-width: 660px; }
    .text { font-family: 'BK'; font-weight: 700; font-size: 28px; color: #fff; line-height: 1.7; }
  </style>
  <div class="wrap">
    <div class="bg"></div>
    <div class="overlay"></div>
    <div class="content"><div class="text">${text}</div></div>
  </div>`;
}

// ── Sections ──
const sections = [
  {
    name: '1-hook',
    html: `<style>${baseCSS}
      .wrap { position: relative; width: ${W}px; height: 810px; display: flex; align-items: center; justify-content: center; }
      .bg { position: absolute; inset: 0; background: url('${images.hook}') center/cover; }
      .overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.55), rgba(0,0,0,0.7)); }
      .content { position: relative; z-index: 1; text-align: center; padding: 0 60px; }
      .title { font-family: 'PS'; font-size: 72px; color: #FDB44B; margin-bottom: 12px; }
      .sub { font-family: 'PS'; font-size: 36px; color: #fff; margin-bottom: 32px; }
      .intro { font-family: 'GMS'; font-weight: 200; font-size: 22px; color: rgba(255,255,255,0.85); line-height: 1.7; }
    </style>
    <div class="wrap">
      <div class="bg"></div>
      <div class="overlay"></div>
      <div class="content">
        <div class="title">전쟁을 끝내자!</div>
        <div class="sub">놀며, 춤추며, 노래하며!</div>
        <div class="intro">제주 강정마을에서 20년 가까이 이어온 평화의 이야기.<br>그리고 그 위에 세워진 음악 축제.</div>
      </div>
    </div>`,
  },
  {
    name: '2-impact',
    html: `<style>${baseCSS}
      .wrap { width: ${W}px; background: #1A2332; padding: 80px 60px; }
      .divider { height: 1px; background: linear-gradient(to right, transparent, rgba(253,180,75,0.3), transparent); }
      .d1 { margin-bottom: 60px; }
      .d2 { margin-top: 60px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; }
      .num { font-family: 'PS'; font-size: 52px; color: #FDB44B; }
      .num span { font-size: 28px; }
      .label { font-family: 'SCD'; font-weight: 300; font-size: 16px; color: rgba(255,255,255,0.5); margin-top: 10px; }
    </style>
    <div class="wrap">
      <div class="divider d1"></div>
      <div class="grid">
        <div><div class="num">20<span>년+</span></div><div class="label">강정마을 평화 저항</div></div>
        <div><div class="num">7000<span>일+</span></div><div class="label">매일 이어온 평화 기도</div></div>
        <div><div class="num">54<span>팀</span></div><div class="label">2026 캠프 참여 음악가</div></div>
      </div>
      <div class="divider d2"></div>
    </div>`,
  },
  {
    name: '3-story1',
    html: storyBlockHtml(images.story1, '강정의 상징이었던 구럼비 바위. 수만 년 동안 파도를 맞으며 형성된 이 용암 바위는 2012년, 해군기지 건설을 위해 폭파되었습니다.'),
  },
  {
    name: '4-story2',
    html: storyBlockHtml(images.story2, '하지만 구럼비 위에서 기도하고, 노래하고, 춤추던 사람들의 기억은 사라지지 않았습니다. 20년 가까이 매일 아침 평화의 기도를 올리는 이 마을의 이야기가 캠프의 뿌리입니다.'),
  },
  {
    name: '5-story3',
    html: storyBlockHtml(images.story3, '군사기지가 아닌 음악으로. 대립이 아닌 연대로. 강정피스앤뮤직캠프는 이 기억 위에 세워진 축제입니다. 가장 아름다운 저항은 함께 노래하는 것이니까요.'),
  },
  {
    name: '6-solidarity',
    html: `<style>${baseCSS}
      .wrap { width: ${W}px; background: #1A2332; padding: 100px 80px; text-align: center; }
      .decl { font-family: 'BK'; font-weight: 700; font-size: 30px; color: rgba(255,255,255,0.92); line-height: 1.7; }
      .divider { height: 1px; background: linear-gradient(to right, transparent, rgba(253,180,75,0.3), transparent); margin: 48px 0; }
      .slogan { font-family: 'PS'; font-size: 56px; color: #FDB44B; line-height: 1.3; }
    </style>
    <div class="wrap">
      <div class="decl">팔레스타인에서 우크라이나까지,<br>전쟁이 끝나지 않는 한<br>우리의 노래도 끝나지 않는다</div>
      <div class="divider"></div>
      <div class="slogan">노래하자, 춤추자,<br>전쟁을 끝내자!</div>
    </div>`,
  },
];

// ── Main ──
async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: 800, deviceScaleFactor: 2 });

  for (const section of sections) {
    const full = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${section.html}</body></html>`;
    await page.setContent(full, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 200));

    const outPath = path.join(OUT, section.name + '.png');
    await page.screenshot({ path: outPath, type: 'png', fullPage: true });
    console.log(`  ${section.name}.png`);
  }

  await browser.close();
  console.log(`\nDone! 6 images saved to ${OUT}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
