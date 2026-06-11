import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const JSON_ROOTS = ['public/data', 'public/locales'];
const TEXT_FILES = ['src/index.css'];
const ASSET_EXTENSIONS = /\.(avif|gif|jpe?g|json|mp3|png|svg|webp|woff2?|xml)$/i;

const errors = [];
let jsonFileCount = 0;
let assetRefCount = 0;

const walk = (dir, visit) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, visit);
    else visit(fullPath);
  }
};

const shouldCheckRef = (value) =>
  typeof value === 'string' &&
  value.startsWith('/') &&
  ASSET_EXTENSIONS.test(value) &&
  !value.includes('${') &&
  !value.includes('{');

const checkPublicRef = (ref, source) => {
  assetRefCount += 1;
  const publicPath = join('public', ref.slice(1));
  if (!existsSync(publicPath)) {
    errors.push(`${source}: missing public asset ${ref}`);
  }
};

const visitJsonValue = (value, source) => {
  if (Array.isArray(value)) {
    value.forEach((item) => visitJsonValue(item, source));
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => visitJsonValue(item, source));
    return;
  }

  if (shouldCheckRef(value)) checkPublicRef(value, source);
};

for (const root of JSON_ROOTS) {
  if (!existsSync(root)) continue;
  walk(root, (filePath) => {
    if (!filePath.endsWith('.json')) return;
    jsonFileCount += 1;
    try {
      visitJsonValue(JSON.parse(readFileSync(filePath, 'utf8')), filePath);
    } catch (error) {
      errors.push(`${filePath}: invalid JSON (${error instanceof Error ? error.message : error})`);
    }
  });
}

for (const filePath of TEXT_FILES) {
  if (!existsSync(filePath)) continue;
  const text = readFileSync(filePath, 'utf8');
  const urlPattern = /url\((['"]?)(\/[^)'"]+)\1\)/g;
  let match;
  while ((match = urlPattern.exec(text))) {
    const ref = match[2];
    if (shouldCheckRef(ref)) checkPublicRef(ref, filePath);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Checked ${jsonFileCount} JSON files and ${assetRefCount} public asset references.`);
