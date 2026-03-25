/**
 * Generate Gangjeong Timeline image
 * Output: 1080px wide PNG
 * Usage: node scripts/generate-timeline-image.js
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const W = 1080;
const OUT = path.join(__dirname, '..', 'output', 'gangjeong-story');
const FD = path.join(__dirname, '..', 'public', 'fonts');

const b64 = f => fs.readFileSync(path.join(FD, f)).toString('base64');

const fonts = {
  gmsB: b64('GmarketSansBold.woff2'),
  gmsM: b64('GmarketSansMedium.woff2'),
  partial: b64('PartialSansKR-Regular.woff2'),
  bookk: b64('BookkMyungjo-Bd.woff2'),
};

const colors = {
  'sunset-coral': '#FF8C69',
  'golden-sun': '#FDB44B',
  'coastal-gray': '#6B7C8A',
  'jeju-ocean': '#0A5F8A',
};

const nodes = [
  { year: '2007', title: '해군기지 건설 결정', desc: '제주 서귀포시 강정마을, 해군기지 예정지로 지정', color: 'sunset-coral' },
  { year: '2009', title: '민군복합항으로 전환', desc: "주민 94% 반대에도, 해군기지를 '관광미항'으로 이름만 바꿔 추진", color: 'sunset-coral' },
  { year: '2012', title: '구럼비 바위 발파', desc: '유네스코 생물권보전지역의 천연 용암 바위, 폭파로 파괴', color: 'sunset-coral' },
  { year: '2015', title: '국제평화상 수상', desc: "강정마을, IPB '숀 맥브라이드 평화상' 수상 — 세계가 인정한 평화운동", color: 'golden-sun' },
  { year: '2016', title: '해군기지 준공', desc: '주민 반대에도 불구하고 기지 완공', color: 'coastal-gray' },
  { year: '2018', title: '대통령 공식 사과', desc: '문재인 대통령, 강정마을 방문 — "절차적 정당성을 지키지 못했다"', color: 'golden-sun' },
  { year: '2023', title: '제1회 캠프 (11팀)', desc: '강정체육공원에서 평화음악캠프 시작', color: 'jeju-ocean' },
  { year: '2024', title: '평화음반 발매', desc: '『이름을 모르는 먼 곳의 그대에게』 13곡 수록', color: 'golden-sun' },
  { year: '2025', title: '기동함대사령부 창설', desc: '해군기지가 기동함대사령부로 승격. 미 해군 함정 기항이 본격화되며 제주가 미국의 군사 전략 거점으로 편입', color: 'sunset-coral' },
  { year: '2026', title: '제3회 캠프 (54팀)', desc: '해군기지 준공 10년, 역대 최대 규모 2박 3일 축제', color: 'golden-sun', badge: '올해' },
];

function buildNodesHtml() {
  return nodes.map((n, i) => {
    const isLeft = i % 2 === 0;
    const isLast = i === nodes.length - 1;
    const c = colors[n.color];
    const dotExtra = isLast ? `box-shadow: 0 0 0 6px rgba(253,180,75,0.25); animation: pulse 2s infinite;` : '';

    const yearBadge = `<span style="display:inline-block;padding:4px 12px;background:${c};color:#fff;font-size:14px;font-weight:700;border-radius:20px;">${n.year}</span>`;
    const olheBadge = n.badge ? `<span style="display:inline-block;padding:4px 12px;background:#FDB44B;color:#1A2332;font-size:14px;font-weight:700;border-radius:20px;margin-left:6px;">${n.badge}</span>` : '';

    const content = `
      <div style="margin-bottom:4px;">${isLeft ? olheBadge + yearBadge : yearBadge + olheBadge}</div>
      <div style="font-family:'GMS';font-weight:700;font-size:20px;color:#1A2332;margin-bottom:4px;">${n.title}</div>
      <div style="font-family:'GMS';font-weight:500;font-size:15px;color:#6B7C8A;line-height:1.5;">${n.desc}</div>
    `;

    return `
      <div style="display:flex;align-items:flex-start;margin-bottom:${isLast ? '0' : '40px'};position:relative;">
        <!-- Left -->
        <div style="width:44%;padding-right:28px;text-align:${isLeft ? 'right' : 'left'};">
          ${isLeft ? content : ''}
        </div>
        <!-- Center dot -->
        <div style="width:12%;display:flex;justify-content:center;padding-top:4px;">
          <div style="width:18px;height:18px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.15);${dotExtra}z-index:2;"></div>
        </div>
        <!-- Right -->
        <div style="width:44%;padding-left:28px;text-align:left;">
          ${!isLeft ? content : ''}
        </div>
      </div>
    `;
  }).join('');
}

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'GMS'; src: url('data:font/woff2;base64,${fonts.gmsB}') format('woff2'); font-weight: 700; }
  @font-face { font-family: 'GMS'; src: url('data:font/woff2;base64,${fonts.gmsM}') format('woff2'); font-weight: 500; }
  @font-face { font-family: 'BK'; src: url('data:font/woff2;base64,${fonts.bookk}') format('woff2'); font-weight: 700; }
  @font-face { font-family: 'PS'; src: url('data:font/woff2;base64,${fonts.partial}') format('woff2'); font-weight: 400; }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 6px rgba(253,180,75,0.25); } 50% { box-shadow: 0 0 0 10px rgba(253,180,75,0.1); } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${W}px; font-family: 'GMS', sans-serif; }
</style></head>
<body>
  <div style="background:#fff;padding:72px 48px 80px;">
    <div style="font-family:'BK';font-weight:700;font-size:40px;color:#1A2332;text-align:center;margin-bottom:56px;">강정의 여정</div>
    <div style="position:relative;max-width:900px;margin:0 auto;">
      <!-- Center line -->
      <div style="position:absolute;left:50%;transform:translateX(-50%);top:0;bottom:0;width:2px;background:linear-gradient(to bottom,rgba(255,140,105,0.35),rgba(10,95,138,0.35),rgba(253,180,75,0.35));"></div>
      ${buildNodesHtml()}
    </div>
  </div>
</body></html>`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: 800, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 200));

  const outPath = path.join(OUT, '7-timeline.png');
  await page.screenshot({ path: outPath, type: 'png', fullPage: true });
  await browser.close();

  const size = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`Done! 7-timeline.png (${size}KB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
