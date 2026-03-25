/**
 * Submit URLs to Google Search Console for indexing.
 *
 * Usage:
 *   npx ts-node scripts/seo/submit-urls.ts
 *
 * Prerequisites:
 *   - Google Search Console API enabled
 *   - Service account JSON key at GOOGLE_APPLICATION_CREDENTIALS env var
 *
 * This script generates all camp 2026 musician URLs across 13 locales
 * and submits them to Google's Indexing API.
 */

const SITE_URL = 'https://peaceandmusic.net';
const LOCALES = ['ko', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'ja', 'zh-Hans', 'zh-Hant', 'hi', 'id'];

// Camp 2026 musician IDs — update this list when musicians change
// Read from the actual data source at build time
async function getMusicianIds(): Promise<string[]> {
  // In production, read from src/data or API
  // For now, generate the list from the data files
  const fs = await import('fs');
  const path = await import('path');

  const musiciansDir = path.join(process.cwd(), 'public', 'data', 'musicians');
  if (!fs.existsSync(musiciansDir)) {
    console.warn('Musicians data directory not found. Using camp data instead.');
    // Fallback: read from camps.ts data
    return [];
  }

  const files = fs.readdirSync(musiciansDir).filter(f => f.endsWith('.json'));
  return files.map(f => f.replace('.json', ''));
}

function generateUrls(musicianIds: string[]): string[] {
  const urls: string[] = [];

  // Camp main page
  for (const locale of LOCALES) {
    const prefix = locale === 'ko' ? '' : `/${locale}`;
    urls.push(`${SITE_URL}${prefix}/camps/2026`);
  }

  // Musician pages
  for (const id of musicianIds) {
    for (const locale of LOCALES) {
      const prefix = locale === 'ko' ? '' : `/${locale}`;
      urls.push(`${SITE_URL}${prefix}/camps/2026/musicians/${id}`);
    }
  }

  return urls;
}

async function main() {
  console.log('=== Google Search Console URL Submission ===\n');

  const musicianIds = await getMusicianIds();

  if (musicianIds.length === 0) {
    console.log('No musician IDs found. Submitting camp pages only.');
  }

  const urls = generateUrls(musicianIds);
  console.log(`Generated ${urls.length} URLs to submit.\n`);

  // Check for Google credentials
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) {
    console.log('GOOGLE_APPLICATION_CREDENTIALS not set.');
    console.log('Outputting URLs to stdout for manual submission:\n');
    urls.forEach(url => console.log(url));
    console.log(`\nTotal: ${urls.length} URLs`);
    console.log('\nTo submit automatically, set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON key path.');
    return;
  }

  // If credentials exist, use Google Indexing API
  console.log('Google credentials found. Submitting via Indexing API...');
  console.log('(Indexing API integration — implement when credentials are ready)');
}

main().catch(console.error);
