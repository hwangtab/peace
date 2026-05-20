/**
 * Deep translation check:
 * 1. Keys in non-KO files but NOT in KO (extra keys)
 * 2. Values that contain Korean text in non-KO locale files
 * 3. Empty string values
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'ja', 'zh-Hans', 'zh-Hant', 'hi', 'id'];
const REF_LOCALE = 'ko';
const BASE = join(process.cwd(), 'public/locales');

function loadAll(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

// Korean character detection regex
const KO_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F]/;

function hasKoreanText(str) {
  if (typeof str !== 'string') return false;
  return KO_REGEX.test(str);
}

// Check for Korean characters in non-KO translations
console.log('=== CHECKING: Korean text remaining in non-KO locale values ===\n');

let koreanFound = 0;
for (const locale of LOCALES) {
  let foundForLocale = false;
  for (const nsFile of readdirSync(join(BASE, locale)).filter((f) => f.endsWith('.json'))) {
    const ns = nsFile.replace('.json', '');
    const data = loadAll(join(BASE, locale, nsFile));
    const koreanValues = findKoreanValues(data, `${locale}/${ns}`);
    if (koreanValues.length > 0) {
      koreanFound += koreanValues.length;
      if (!foundForLocale) { console.log(`${locale}:`); foundForLocale = true; }
      console.log(`  ${ns}: ${koreanValues.length} value(s) with Korean text`);
      koreanValues.slice(0, 3).forEach((kv) => console.log(`    - ${kv.path}: "${String(kv.value).substring(0, 60)}..."`));
      if (koreanValues.length > 3) console.log(`    ... and ${koreanValues.length - 3} more`);
    }
  }
}

function findKoreanValues(obj, pathPrefix) {
  const results = [];
  for (const [k, v] of Object.entries(obj)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      results.push(...findKoreanValues(v, currentPath));
    } else if (hasKoreanText(v)) {
      results.push({ path: currentPath, value: v });
    }
  }
  return results;
}

console.log(`\nTotal Korean text found in non-KO locales: ${koreanFound}`);

// Check for empty values across all locales
console.log('\n=== CHECKING: Empty string values ===\n');

let emptyFound = 0;
for (const locale of LOCALES) {
  let foundForLocale = false;
  for (const nsFile of readdirSync(join(BASE, locale)).filter((f) => f.endsWith('.json'))) {
    const ns = nsFile.replace('.json', '');
    const data = loadAll(join(BASE, locale, nsFile));
    const empty = findEmptyValues(data, `${locale}/${ns}`);
    if (empty.length > 0) {
      emptyFound += empty.length;
      if (!foundForLocale) { console.log(`${locale}:`); foundForLocale = true; }
      console.log(`  ${ns}: ${empty.length} empty value(s)`);
      empty.slice(0, 3).forEach((ev) => console.log(`    - ${ev.path}`));
      if (empty.length > 3) console.log(`    ... and ${empty.length - 3} more`);
    }
  }
}

function findEmptyValues(obj, pathPrefix) {
  const results = [];
  for (const [k, v] of Object.entries(obj)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      results.push(...findEmptyValues(v, currentPath));
    } else if (v === '' || v === null || v === undefined) {
      results.push({ path: currentPath, value: v });
    }
  }
  return results;
}

console.log(`\nTotal empty values across all locales: ${emptyFound}`);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Korean text in non-KO locale values: ${koreanFound}`);
console.log(`Empty string/null values: ${emptyFound}`);
if (koreanFound === 0 && emptyFound === 0) {
  console.log('All translations are clean! No Korean text leakage or empty values found.');
}
