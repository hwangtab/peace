#!/usr/bin/env node
/**
 * videos.json 의 빈 `date` 필드를 YouTube 워치 페이지의 `uploadDate` 메타로 백필.
 *
 * - 루트 파일을 기준으로 누락 항목을 찾아 한 번씩만 fetch
 * - 결과는 `YYYY-MM-DD` 로 저장 (기존 항목 포맷과 동일; schema 출력 시 KST 자동 부여)
 * - 모든 로케일 파일(`public/data/<locale>/videos.json`)에도 동일하게 반영
 * - `--dry-run` 플래그로 변경 없이 결과만 미리 확인 가능
 *
 * Usage:
 *   node scripts/backfill-video-dates.js          # 실제 적용
 *   node scripts/backfill-video-dates.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PUBLIC_DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const ROOT_FILE = path.join(PUBLIC_DATA_DIR, 'videos.json');
const REQUEST_DELAY_MS = 350;
const DRY_RUN = process.argv.includes('--dry-run');

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function extractVideoId(url) {
  if (!url) return null;
  const embed = url.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embed) return embed[1];
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watch) return watch[1];
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return short[1];
  return null;
}

function fetchUploadDate(videoId) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.youtube.com',
      path: `/watch?v=${videoId}`,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
    };
    https
      .get(options, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          resolve({ ok: false, reason: `HTTP ${res.statusCode}` });
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          // uploadDate가 ISO 8601(타임존 포함) 또는 YYYY-MM-DD 으로 등장
          const m = data.match(/"uploadDate":"(\d{4}-\d{2}-\d{2})/);
          if (m) {
            resolve({ ok: true, date: m[1] });
          } else if (data.includes('Video unavailable')) {
            resolve({ ok: false, reason: 'unavailable' });
          } else {
            resolve({ ok: false, reason: 'no uploadDate match' });
          }
        });
      })
      .on('error', (err) => {
        resolve({ ok: false, reason: err.message });
      });
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function listLocaleFiles() {
  const entries = fs.readdirSync(PUBLIC_DATA_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(PUBLIC_DATA_DIR, e.name, 'videos.json'))
    .filter((p) => fs.existsSync(p));
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async function main() {
  const root = readJson(ROOT_FILE);
  const targets = root.filter((v) => !v.date && v.youtubeUrl);
  console.log(`Total videos: ${root.length}`);
  console.log(`Missing date: ${targets.length}`);
  if (targets.length === 0) return;
  if (DRY_RUN) console.log('(dry-run mode — no files will be written)');

  /** @type {Record<number, string>} */
  const updates = {};
  /** @type {Array<{ id: number, reason: string }>} */
  const failures = [];

  for (let i = 0; i < targets.length; i++) {
    const v = targets[i];
    const vid = extractVideoId(v.youtubeUrl);
    const prefix = `[${i + 1}/${targets.length}] id=${v.id}`;
    if (!vid) {
      failures.push({ id: v.id, reason: 'cannot extract video id' });
      console.log(`${prefix} ✗ cannot extract video id from ${v.youtubeUrl}`);
      continue;
    }
    const result = await fetchUploadDate(vid);
    if (result.ok) {
      updates[v.id] = result.date;
      console.log(`${prefix} ✓ ${result.date}  (${vid})`);
    } else {
      failures.push({ id: v.id, reason: result.reason });
      console.log(`${prefix} ✗ ${result.reason}  (${vid})`);
    }
    if (i < targets.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  console.log('');
  console.log(`Resolved: ${Object.keys(updates).length}`);
  console.log(`Failed:   ${failures.length}`);
  if (failures.length) {
    console.log('Failure details:');
    failures.forEach((f) => console.log(`  id=${f.id}  ${f.reason}`));
  }

  if (DRY_RUN) return;
  if (Object.keys(updates).length === 0) {
    console.log('Nothing to write.');
    return;
  }

  const files = [ROOT_FILE, ...listLocaleFiles()];
  let written = 0;
  for (const file of files) {
    const data = readJson(file);
    let changed = false;
    for (const v of data) {
      if (updates[v.id] !== undefined && !v.date) {
        v.date = updates[v.id];
        changed = true;
      }
    }
    if (changed) {
      writeJson(file, data);
      written++;
      console.log(`wrote ${path.relative(process.cwd(), file)}`);
    }
  }
  console.log(`\nUpdated ${written}/${files.length} files.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
