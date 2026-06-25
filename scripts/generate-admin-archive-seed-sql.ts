import { buildArchiveSeedRows } from './seed-admin-archive';
import fs from 'fs';
import path from 'path';

type SeedRow = Record<string, unknown>;

interface TableSeedConfig {
  table: string;
  columns: string[];
  recordTypes: string[];
  conflict: string[];
}

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const dollarQuoteJson = (rows: SeedRow[], suffix: string): string => {
  const tag = `$peace_archive_seed_${suffix}$`;
  return `${tag}${JSON.stringify(rows)}${tag}`;
};

const buildUpsertSql = (config: TableSeedConfig, rows: SeedRow[], chunkSize = 250): string => {
  const assignments = config.columns
    .filter((column) => !config.conflict.includes(column))
    .map((column) => `${column} = excluded.${column}`)
    .join(',\n    ');
  const recordDefinition = config.columns
    .map((column, index) => `${column} ${config.recordTypes[index]}`)
    .join(', ');

  return chunk(rows, chunkSize)
    .map((rowChunk, index) => {
      const jsonLiteral = dollarQuoteJson(rowChunk, `${config.table}_${index}`);
      return `insert into public.${config.table} (${config.columns.join(', ')})
select ${config.columns.join(', ')}
from jsonb_to_recordset(${jsonLiteral}::jsonb) as seed(${recordDefinition})
on conflict (${config.conflict.join(', ')}) do update set
    ${assignments};`;
    })
    .join('\n\n');
};

const writeSqlParts = (sql: string, outputDir: string, maxBytes = 700_000) => {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const statements = sql
    .replace(/^begin;\n\n/, '')
    .replace(/\n\ncommit;\n?$/, '')
    .split(/\n\n(?=insert into public\.)/)
    .map((item) => item.trim())
    .filter(Boolean);

  let current: string[] = [];
  let currentBytes = 0;
  let part = 1;

  const flush = () => {
    if (!current.length) return;
    const body = `begin;\n\n${current.join('\n\n')}\n\ncommit;\n`;
    fs.writeFileSync(path.join(outputDir, `${String(part).padStart(3, '0')}.sql`), body);
    part += 1;
    current = [];
    currentBytes = 0;
  };

  for (const statement of statements) {
    const bytes = Buffer.byteLength(statement);
    if (current.length && currentBytes + bytes > maxBytes) flush();
    current.push(statement);
    currentBytes += bytes;
  }

  flush();
  return { statements: statements.length, parts: part - 1 };
};

const timestamp = process.env.SEED_TIMESTAMP || new Date().toISOString();
const rows = buildArchiveSeedRows(timestamp);

const sections = [
  buildUpsertSql(
    {
      table: 'archive_videos',
      columns: [
        'public_id',
        'locale',
        'title',
        'description',
        'youtube_url',
        'date',
        'location',
        'event_type',
        'event_year',
        'thumbnail_url',
        'duration',
        'musician_ids',
        'director_musician_id',
        'status',
        'sort_order',
        'published_at',
      ],
      recordTypes: [
        'integer',
        'text',
        'text',
        'text',
        'text',
        'date',
        'text',
        'text',
        'integer',
        'text',
        'text',
        'integer[]',
        'integer',
        'text',
        'integer',
        'timestamptz',
      ],
      conflict: ['public_id', 'locale'],
    },
    rows.videos
  ),
  buildUpsertSql(
    {
      table: 'archive_press_items',
      columns: [
        'public_id',
        'locale',
        'title',
        'publisher',
        'date',
        'source_url',
        'description',
        'image_url',
        'event_type',
        'event_year',
        'status',
        'sort_order',
        'published_at',
      ],
      recordTypes: [
        'integer',
        'text',
        'text',
        'text',
        'date',
        'text',
        'text',
        'text',
        'text',
        'integer',
        'text',
        'integer',
        'timestamptz',
      ],
      conflict: ['public_id', 'locale'],
    },
    rows.press
  ),
  buildUpsertSql(
    {
      table: 'cms_content_blocks',
      columns: [
        'key',
        'locale',
        'route_path',
        'placement',
        'label',
        'value',
        'description',
        'status',
        'sort_order',
        'published_at',
      ],
      recordTypes: [
        'text',
        'text',
        'text',
        'text',
        'text',
        'text',
        'text',
        'text',
        'integer',
        'timestamptz',
      ],
      conflict: ['key', 'locale'],
    },
    rows.contentRows
  ),
];

const sql = `begin;\n\n${sections.join('\n\n')}\n\ncommit;\n`;
const partsDir = process.env.SEED_SQL_PARTS_DIR;

if (partsDir) {
  process.stdout.write(`${JSON.stringify(writeSqlParts(sql, partsDir), null, 2)}\n`);
} else {
  process.stdout.write(sql);
}
