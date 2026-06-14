#!/usr/bin/env node
import { spawnSync } from 'child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const shouldKeep = args.includes('--keep');
const shouldStrict = args.includes('--strict');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: pnpm i18n:extract [--apply] [--keep] [--strict]

Runs i18next-cli into a temporary directory first. By default this leaves a
reviewable candidate outside public/locales. With --apply, extracted keys are
merged into public/locales without deleting namespaces or overwriting existing
translations.

Options:
  --apply   Merge extracted keys into public/locales.
  --keep    Keep temporary output after --apply.
  --strict  Exit non-zero if parser output misses current namespaces/keys.`);
  process.exit(0);
}

const publicKoDir = join(repoRoot, 'public', 'locales', 'ko');
const publicLocalesDir = join(repoRoot, 'public', 'locales');
const extractionRoot = mkdtempSync(join(tmpdir(), 'peace-i18n-raw-'));
const tempRoot = mkdtempSync(join(tmpdir(), 'peace-i18n-extract-'));

const outputPattern = join(extractionRoot, '{{language}}', '{{namespace}}.json');
const extractorBin = join(repoRoot, 'node_modules', '.bin', 'i18next-cli');

const extractor = spawnSync(extractorBin, ['--config', 'i18next.config.ts', 'extract'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    I18NEXT_OUTPUT: outputPattern,
  },
});

if (extractor.status !== 0) {
  console.error(`i18next-cli extract failed with exit code ${extractor.status}.`);
  process.exit(extractor.status ?? 1);
}

cpSync(publicLocalesDir, tempRoot, { recursive: true });

function flattenKeys(value, prefix = '', out = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    out.push(prefix);
    return out;
  }

  for (const [key, child] of Object.entries(value)) {
    flattenKeys(child, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

const publicNamespaces = readdirSync(publicKoDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace(/\.json$/, ''))
  .sort();
const knownNamespaces = new Set(publicNamespaces);

function mergeMissing(target, source, options = {}) {
  const { namespace, depth = 0 } = options;
  let added = 0;
  for (const [key, sourceValue] of Object.entries(source)) {
    if (
      namespace === 'translation' &&
      depth === 0 &&
      knownNamespaces.has(key) &&
      key !== namespace
    ) {
      continue;
    }

    const pluralBaseKey = key.replace(/_(zero|one|two|few|many|other)$/, '');
    if (pluralBaseKey !== key && pluralBaseKey in target) {
      continue;
    }

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      added += mergeMissing(target[key], sourceValue, { namespace, depth: depth + 1 });
    } else if (!(key in target)) {
      target[key] = sourceValue;
      added += flattenKeys(sourceValue).length;
    }
  }
  return added;
}

const rawLocales = readdirSync(extractionRoot)
  .filter((entry) => statSync(join(extractionRoot, entry)).isDirectory())
  .sort();

for (const locale of rawLocales) {
  const rawLocaleDir = join(extractionRoot, locale);
  const candidateLocaleDir = join(tempRoot, locale);
  mkdirSync(candidateLocaleDir, { recursive: true });

  for (const file of readdirSync(rawLocaleDir).filter((entry) => entry.endsWith('.json'))) {
    const rawFile = join(rawLocaleDir, file);
    const candidateFile = join(candidateLocaleDir, file);
    const namespace = file.replace(/\.json$/, '');
    const current = existsSync(candidateFile) ? readJson(candidateFile) : {};
    mergeMissing(current, readJson(rawFile), { namespace });
    writeFileSync(candidateFile, `${JSON.stringify(current, null, 2)}\n`, 'utf8');
  }
}

const extractedKoDir = join(tempRoot, 'ko');
const extractedNamespaces = existsSync(extractedKoDir)
  ? readdirSync(extractedKoDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace(/\.json$/, ''))
      .sort()
  : [];

const missingNamespaces = publicNamespaces.filter((ns) => !extractedNamespaces.includes(ns));
const undercovered = [];

for (const ns of publicNamespaces) {
  const publicFile = join(publicKoDir, `${ns}.json`);
  const extractedFile = join(extractedKoDir, `${ns}.json`);
  if (!existsSync(extractedFile)) continue;

  const publicKeyCount = flattenKeys(readJson(publicFile)).length;
  const extractedKeyCount = flattenKeys(readJson(extractedFile)).length;

  if (extractedKeyCount < publicKeyCount) {
    undercovered.push({ ns, publicKeyCount, extractedKeyCount });
  }
}

const hasIncompleteCoverage = missingNamespaces.length > 0 || undercovered.length > 0;

if (hasIncompleteCoverage) {
  console.warn('\ni18n extraction coverage is incomplete.');
  if (missingNamespaces.length > 0) {
    console.warn(`Missing namespaces: ${missingNamespaces.join(', ')}`);
  }
  if (undercovered.length > 0) {
    console.warn('Undercovered namespaces:');
    for (const item of undercovered) {
      console.warn(
        `  ${item.ns}: public=${item.publicKeyCount}, extracted=${item.extractedKeyCount}`
      );
    }
  }
  console.warn(
    'Existing translations will be preserved; only extracted missing keys can be added.'
  );
  if (shouldStrict) {
    console.error('Strict mode enabled; public/locales was not modified.');
    console.error(`Temporary output kept: ${tempRoot}`);
    process.exit(1);
  }
}

if (shouldApply) {
  const changes = [];
  const locales = readdirSync(tempRoot)
    .filter((entry) => statSync(join(tempRoot, entry)).isDirectory())
    .sort();

  for (const locale of locales) {
    const extractedLocaleDir = join(tempRoot, locale);
    const publicLocaleDir = join(publicLocalesDir, locale);
    mkdirSync(publicLocaleDir, { recursive: true });

    for (const file of readdirSync(extractedLocaleDir).filter((entry) => entry.endsWith('.json'))) {
      const extractedFile = join(extractedLocaleDir, file);
      const publicFile = join(publicLocaleDir, file);
      const namespace = file.replace(/\.json$/, '');
      const current = existsSync(publicFile) ? readJson(publicFile) : {};
      const added = mergeMissing(current, readJson(extractedFile), { namespace });

      if (added > 0 || !existsSync(publicFile)) {
        writeFileSync(publicFile, `${JSON.stringify(current, null, 2)}\n`, 'utf8');
        changes.push(`${locale}/${file}: +${added}`);
      }
    }
  }

  if (changes.length > 0) {
    console.log(`i18n extraction merged into ${relative(repoRoot, publicLocalesDir)}:`);
    changes.forEach((change) => console.log(`  ${change}`));
  } else {
    console.log('i18n extraction found no new keys to merge.');
  }

  if (!shouldKeep) {
    rmSync(tempRoot, { recursive: true, force: true });
  } else {
    console.log(`Temporary output kept: ${tempRoot}`);
  }
} else {
  console.log(`i18n extraction candidate written to ${tempRoot}.`);
  console.log('Run with --apply to merge missing extracted keys without overwriting translations.');
}

rmSync(extractionRoot, { recursive: true, force: true });
