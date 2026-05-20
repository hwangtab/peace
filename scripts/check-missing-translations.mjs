/**
 * Check for missing translation keys across all locales.
 * Uses ko as the reference language.
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'ja', 'zh-Hans', 'zh-Hant', 'hi', 'id'];
const REF_LOCALE = 'ko';
const BASE = join(process.cwd(), 'public/locales');

function loadKeys(filePath) {
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    return flatKeys(data, '');
  } catch {
    return new Set();
  }
}

function flatKeys(obj, prefix) {
  const keys = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flatKeys(v, fullKey).forEach((f) => keys.add(f));
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

function getKoValue(keyParts, ns) {
  const refFile = join(BASE, REF_LOCALE, `${ns}.json`);
  try {
    const data = JSON.parse(readFileSync(refFile, 'utf-8'));
    let val = data;
    for (const p of keyParts) {
      val = val?.[p];
    }
    return typeof val === 'string' ? val : String(val);
  } catch {
    return '(ko 파일 없음)';
  }
}

// Phase 1: Check missing files
console.log('=== PHASE 1: Missing translation files ===\n');
const localeNsMap = new Map();
for (const locale of [...LOCALES, REF_LOCALE]) {
  const dir = join(BASE, locale);
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    localeNsMap.set(locale, new Set(files.map((f) => f.replace('.json', ''))));
  } catch {
    console.log(`[MISSING DIR] ${locale}/`);
    localeNsMap.set(locale, new Set());
  }
}

const allNs = new Set();
localeNsMap.forEach((ns) => ns.forEach((n) => allNs.add(n)));

let missingFileCount = 0;
for (const locale of LOCALES) {
  const existingNs = localeNsMap.get(locale);
  for (const ns of [...allNs].sort()) {
    if (!existingNs.has(ns)) {
      console.log(`[MISSING FILE] ${locale}/${ns}.json`);
      missingFileCount++;
    }
  }
}
if (missingFileCount === 0) console.log('All translation files exist.');

// Phase 2: Compare keys with ko reference
console.log('\n=== PHASE 2: Missing keys (compared to ko) ===\n');

let totalMissing = 0;
const summary = [];

for (const ns of [...allNs].sort()) {
  const refFile = join(BASE, REF_LOCALE, `${ns}.json`);
  const refKeys = loadKeys(refFile);
  
  for (const locale of LOCALES) {
    const otherFile = join(BASE, locale, `${ns}.json`);
    const otherKeys = loadKeys(otherFile);
    const missing = [...refKeys].filter((k) => !otherKeys.has(k)).sort();
    
    if (missing.length > 0) {
      totalMissing += missing.length;
      summary.push({ locale, ns, missing });
      console.log(`${locale}/${ns}: ${missing.length} missing key(s)`);
      missing.slice(0, 5).forEach((k) => console.log(`    - ${k}`));
      if (missing.length > 5) console.log(`    ... and ${missing.length - 5} more`);
    }
  }
}

// Phase 3: Check for empty values in ko
console.log('\n=== PHASE 3: Empty/placeholder values in ko ===\n');

function findEmpty(obj, prefix) {
  const results = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      results.push(...findEmpty(v, fullKey));
    } else if (v === '' || (typeof v === 'string' && /^\[|!\[|TODO|\?\?\?|PLACEHOLDER/i.test(v))) {
      results.push(fullKey);
    }
  }
  return results;
}

let emptyCount = 0;
for (const nsFile of [...readdirSync(join(BASE, REF_LOCALE)).filter((f) => f.endsWith('.json'))].sort()) {
  const ns = nsFile.replace('.json', '');
  const data = JSON.parse(readFileSync(join(BASE, REF_LOCALE, nsFile), 'utf-8'));
  const empty = findEmpty(data, '');
  if (empty.length > 0) {
    emptyCount += empty.length;
    console.log(`${ns}: ${empty.length} empty/placeholder value(s)`);
    empty.forEach((key) => {
      const parts = key.split('.');
      let val = data;
      for (const p of parts) val = val?.[p];
      console.log(`    - ${key}: "${String(val)}"`);
    });
  }
}

// Summary
let koTotalKeys = 0;
for (const ns of [...allNs].sort()) {
  koTotalKeys += loadKeys(join(BASE, REF_LOCALE, `${ns}.json`)).size;
}

console.log(`\n=== SUMMARY ===`);
console.log(`총 ko 기준 키: ${koTotalKeys}`);
console.log(`누락된 번역 파일: ${missingFileCount}개`);
console.log(`누락된 키 전체: ${totalMissing}개`);
const coverage = koTotalKeys > 0 ? ((1 - totalMissing / (koTotalKeys * LOCALES.length)) * 100).toFixed(1) : 'N/A';
console.log(`전체 번역 커버리지: ${coverage}%`);

// Write detailed report
const reportFile = join(process.cwd(), 'scripts/translation-gap-report.md');
let report = '# 번역 누락 보고서\n\n';
report += `## 생성일: ${new Date().toISOString().split('T')[0]}\n\n`;
report += `- 기준 언어: ko\n`;
report += `- 대상 언어: ${LOCALES.join(', ')}\n`;
report += `- 총 네임스페이스: ${[...allNs].sort().join(', ')}\n`;
report += `- ko 기준 키 수: ${koTotalKeys}\n\n`;

if (summary.length > 0) {
  for (const { locale, ns, missing } of summary) {
    report += `### ${locale}/${ns}.json (${missing.length}개 누락)\n\n\`\`\`json\n`;
    const obj = {};
    let current = obj;
    for (const key of missing) {
      const parts = key.split('.');
      for (let i = 0; i < parts.length; i++) {
        if (i === parts.length - 1) {
          current[parts[i]] = getKoValue(parts, ns);
        } else {
          current[parts[i]] = current[parts[i]] || {};
          current = current[parts[i]];
        }
      }
    }
    report += JSON.stringify(obj, null, 2);
    report += '\n```\n\n';
  }
} else {
  report += '**모든 언어의 모든 네임스페이스에서 키 누락 없음 (100% parity)**\n';
}

if (emptyCount > 0) {
  report += `\n## 빈 값/플레이스홀더 (ko 기준)\n\n`;
  report += `ko 번역 파일에 ${emptyCount}개의 빈 값 또는 플레이스홀더가 발견되었습니다.\n`;
}

writeFileSync(reportFile, report, 'utf-8');
console.log(`\n→ 상세 보고서: ${reportFile}`);
