/**
 * Generate artist introduction card images for camp-2026
 * Uses Puppeteer (headless Chrome) for proper font & layout rendering
 * Output: 1080x1350px PNG files (Instagram 4:5 ratio)
 * Usage: node scripts/generate-artist-cards.js
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// ── Config ──────────────────────────────────────────────
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'artist-cards');
const MUSICIANS_JSON = path.join(__dirname, '..', 'public', 'data', 'musicians.json');
const FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images-webp', 'musicians');

// Camp 2026 participant musician IDs
const CAMP_2026_IDS = [
  14, 5, 15, 3, 16, 4, 17, 18, 19, 20, 21, 10, 22, 7, 23, 24,
  13, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  12, 42, 11, 43, 2, 44, 45, 46, 47, 48, 49, 50, 51, 52, 60, 59,
  53, 54, 55, 56, 57, 58
];

// ── HTML Template ───────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Pre-load fonts as base64 data URIs (loaded once, reused for all cards)
let fontBoldDataUri = '';
let fontMediumDataUri = '';
let fontLightDataUri = '';

function loadFonts() {
  const bold = path.join(FONTS_DIR, 'GmarketSansBold.woff2');
  const medium = path.join(FONTS_DIR, 'GmarketSansMedium.woff2');
  const light = path.join(FONTS_DIR, 'GmarketSansLight.woff2');
  if (fs.existsSync(bold)) fontBoldDataUri = `data:font/woff2;base64,${fs.readFileSync(bold).toString('base64')}`;
  if (fs.existsSync(medium)) fontMediumDataUri = `data:font/woff2;base64,${fs.readFileSync(medium).toString('base64')}`;
  if (fs.existsSync(light)) fontLightDataUri = `data:font/woff2;base64,${fs.readFileSync(light).toString('base64')}`;
}

function buildCardHtml(musician, photoDataUri) {
  const genreTags = (musician.genre || [])
    .map(g => `<span class="tag">${escapeHtml(g)}</span>`)
    .join('');

  const photoHtml = photoDataUri
    ? `<img class="photo" src="${photoDataUri}" alt="" />`
    : `<div class="placeholder">
         <div class="placeholder-initial">${escapeHtml(musician.name.charAt(0))}</div>
       </div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'GMarketSans';
    src: url('${fontBoldDataUri}') format('woff2');
    font-weight: 700;
    font-display: block;
  }
  @font-face {
    font-family: 'GMarketSans';
    src: url('${fontMediumDataUri}') format('woff2');
    font-weight: 500;
    font-display: block;
  }
  @font-face {
    font-family: 'GMarketSans';
    src: url('${fontLightDataUri}') format('woff2');
    font-weight: 200;
    font-display: block;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: ${CARD_WIDTH}px;
    height: ${CARD_HEIGHT}px;
    overflow: hidden;
    font-family: 'GMarketSans', sans-serif;
    position: relative;
    background: #1A2332;
  }

  /* ── Photo ── */
  .photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }

  /* ── Placeholder (no photo) ── */
  .placeholder {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0A5F8A 0%, #1A2332 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .placeholder-initial {
    font-size: 200px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.08);
  }

  /* ── Gradient overlay ── */
  .gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 15%,
      rgba(10, 30, 50, 0.15) 32%,
      rgba(10, 30, 50, 0.55) 48%,
      rgba(10, 30, 50, 0.85) 62%,
      rgba(10, 30, 50, 0.96) 78%,
      rgba(10, 30, 50, 0.99) 100%
    );
  }

  /* ── Content ── */
  .content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 52px 52px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Genre Tags ── */
  .tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }
  .tag {
    background: #FDB44B;
    color: #1A2332;
    font-weight: 700;
    font-size: 26px;
    padding: 10px 24px;
    border-radius: 24px;
    letter-spacing: -0.2px;
    white-space: nowrap;
  }

  /* ── Name ── */
  .name {
    font-weight: 700;
    font-size: 76px;
    color: #fff;
    line-height: 1.15;
    letter-spacing: -0.5px;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  /* ── Description ── */
  .desc {
    font-weight: 500;
    font-size: 32px;
    color: rgba(255, 255, 255, 0.82);
    line-height: 1.55;
    letter-spacing: -0.2px;
    word-break: keep-all;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Footer ── */
  .footer {
    margin-top: 10px;
    padding-top: 18px;
    border-top: 1px solid rgba(253, 180, 75, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    font-size: 24px;
    color: rgba(253, 180, 75, 0.85);
    letter-spacing: 0.5px;
  }
  .footer-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(253, 180, 75, 0.5);
    flex-shrink: 0;
  }
</style>
</head>
<body>
  ${photoHtml}
  <div class="gradient"></div>
  <div class="content">
    <div class="tags">${genreTags}</div>
    <div class="name">${escapeHtml(musician.name)}</div>
    <div class="desc">${escapeHtml(musician.shortDescription || '')}</div>
    <div class="footer">
      <span>제3회 강정피스앤뮤직캠프</span>
      <div class="footer-dot"></div>
      <span>2026.6.5-7</span>
    </div>
  </div>
</body>
</html>`;
}

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log('Loading data and fonts...');

  // Load fonts (once, reused for all cards)
  loadFonts();

  // Load musicians
  const musicians = JSON.parse(fs.readFileSync(MUSICIANS_JSON, 'utf-8'));
  const camp2026Musicians = musicians.filter(m => CAMP_2026_IDS.includes(m.id));
  console.log(`Found ${camp2026Musicians.length} / ${CAMP_2026_IDS.length} musicians for camp-2026`);

  // Ensure output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Launch browser
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: CARD_WIDTH, height: CARD_HEIGHT, deviceScaleFactor: 1 });

  let success = 0;
  let failed = 0;

  for (let i = 0; i < camp2026Musicians.length; i++) {
    const musician = camp2026Musicians[i];
    const seq = i + 1;
    const sanitizedName = musician.name.replace(/[\s/\\?%*:|"<>]/g, '');
    const filename = `${seq}-${sanitizedName}.png`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    try {
      // Use imageUrl from data (id and image filename don't always match)
      let photoDataUri = null;
      if (musician.imageUrl) {
        const photoPath = path.join(__dirname, '..', 'public', musician.imageUrl);
        if (fs.existsSync(photoPath)) {
          const photoBase64 = fs.readFileSync(photoPath).toString('base64');
          photoDataUri = `data:image/webp;base64,${photoBase64}`;
        } else {
          console.warn(`  No photo for ${musician.name} (ID ${musician.id}) - file not found: ${musician.imageUrl}`);
        }
      } else {
        console.warn(`  No photo for ${musician.name} (ID ${musician.id}) - no imageUrl`);
      }

      const html = buildCardHtml(musician, photoDataUri);

      await page.setContent(html, { waitUntil: 'load' });
      // Wait for fonts and images to load
      await page.evaluate(() => document.fonts.ready);
      // Small extra wait for image decode
      await new Promise(r => setTimeout(r, 100));

      await page.screenshot({
        path: outputPath,
        type: 'png',
        clip: { x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
      });

      console.log(`  [${success + failed + 1}/${camp2026Musicians.length}] ${filename}`);
      success++;
    } catch (err) {
      console.error(`  FAILED: ${musician.name} (ID ${musician.id}): ${err.message}`);
      failed++;
    }
  }

  await browser.close();
  console.log(`\nDone! ${success} cards generated, ${failed} failed.`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
