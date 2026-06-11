import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const timetablePath = resolve('src/data/timetable-2026.ts');
const before = readFileSync(timetablePath, 'utf8');

const result = spawnSync('pnpm', ['build:timetable'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const after = readFileSync(timetablePath, 'utf8');

if (before !== after) {
  console.error(
    'Generated timetable is out of date. Run `pnpm build:timetable` and commit the updated src/data/timetable-2026.ts.'
  );
  process.exit(1);
}
