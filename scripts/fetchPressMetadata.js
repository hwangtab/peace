const ogs = require('open-graph-scraper');
const fs = require('fs');
const path = require('path');

// Config
const FETCH_DELAY_MS = 1000; // Rate limiting (1 second between requests)
const REQUEST_TIMEOUT_MS = 10000; // 10 second timeout per request

const isBrowserSafeImageUrl = (imageUrl) =>
  imageUrl.startsWith('https://') || imageUrl.startsWith('/');

/**
 * Load press items from the canonical Korean press data JSON.
 * @returns {Array} Array of press items
 */
const loadPressData = async () => {
  const pressFilePath = path.join(__dirname, '../public/data/press.json');

  try {
    const items = JSON.parse(fs.readFileSync(pressFilePath, 'utf-8'));

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('No items parsed from press data');
    }

    return items;
  } catch (error) {
    console.error('Error loading press data:', error.message);
    throw error;
  }
};

/**
 * Fetch Open Graph metadata for a single press article
 * @param {Object} pressItem - Press item with url and other properties
 * @returns {Promise<Object>} Result object with fetched metadata
 */
const fetchPressMetadata = async (pressItem) => {
  const options = {
    url: pressItem.url,
    timeout: REQUEST_TIMEOUT_MS,
    fetchOptions: {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
  };

  try {
    const { result, error: ogsError } = await ogs(options);

    if (ogsError) {
      console.error(`  ✗ OG Error for ID ${pressItem.id}: ${ogsError}`);
      return {
        id: pressItem.id,
        title: pressItem.title,
        url: pressItem.url,
        imageUrl: '',
        currentImageUrl: pressItem.imageUrl || '',
        error: ogsError,
      };
    }

    // Extract image URL from Open Graph data
    let imageUrl = '';
    if (result.ogImage) {
      if (Array.isArray(result.ogImage)) {
        imageUrl = result.ogImage[0]?.url || '';
      } else {
        imageUrl = result.ogImage.url || result.ogImage || '';
      }
    }

    const status = imageUrl ? '✓' : '✗';
    console.log(`  ${status} ID ${pressItem.id}: ${imageUrl ? 'Found image' : 'No image found'}`);

    return {
      id: pressItem.id,
      title: pressItem.title,
      url: pressItem.url,
      imageUrl: imageUrl,
      currentImageUrl: pressItem.imageUrl || '',
    };
  } catch (error) {
    console.error(`  ✗ Exception for ID ${pressItem.id}: ${error.message}`);
    return {
      id: pressItem.id,
      title: pressItem.title,
      url: pressItem.url,
      imageUrl: '',
      currentImageUrl: pressItem.imageUrl || '',
      error: error.message,
    };
  }
};

/**
 * Sleep utility for rate limiting
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Main execution
 */
const run = async () => {
  console.log('='.repeat(70));
  console.log('Press Article Thumbnail Fetcher');
  console.log('='.repeat(70));
  console.log('');

  try {
    // Load press data
    const pressData = await loadPressData();
    console.log(`Loaded ${pressData.length} press items\n`);

    // Determine fetch mode
    const fetchAll = process.argv.includes('--all');
    const eventYearFlagIndex = process.argv.indexOf('--event-year');
    const eventYearValue =
      eventYearFlagIndex >= 0
        ? process.argv[eventYearFlagIndex + 1]
        : process.argv.find((arg) => arg.startsWith('--event-year='))?.split('=')[1];
    const eventYear = eventYearValue ? Number(eventYearValue) : undefined;
    const itemsToFetch = (fetchAll ? pressData : pressData.filter((p) => !p.imageUrl)).filter(
      (item) => eventYear === undefined || item.eventYear === eventYear
    );

    console.log(`Mode: ${fetchAll ? 'ALL ARTICLES' : 'MISSING ONLY'}`);
    if (eventYear !== undefined) {
      console.log(`Event year: ${eventYear}`);
    }
    console.log(`Items to fetch: ${itemsToFetch.length}\n`);

    if (itemsToFetch.length === 0) {
      console.log('No items to fetch. All press items have imageUrl.');
      return;
    }

    console.log('Fetching metadata...');
    console.log('');

    // Fetch metadata with rate limiting
    const results = [];
    for (let i = 0; i < itemsToFetch.length; i++) {
      const item = itemsToFetch[i];
      console.log(`[${i + 1}/${itemsToFetch.length}] Fetching: "${item.title}"`);

      const result = await fetchPressMetadata(item);
      results.push(result);

      // Rate limiting (1 second between requests)
      if (i < itemsToFetch.length - 1) {
        await sleep(FETCH_DELAY_MS);
      }
    }

    // Output formatted results
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total processed: ${results.length}`);
    console.log(`Found images: ${results.filter((r) => r.imageUrl).length}`);
    console.log(`Missing images: ${results.filter((r) => !r.imageUrl).length}`);
    console.log(`Errors: ${results.filter((r) => r.error).length}`);

    // Output detailed results for manual review
    console.log('\n' + '='.repeat(70));
    console.log('DETAILED RESULTS - Copy imageUrl values to press JSON files');
    console.log('='.repeat(70));
    console.log('');

    results.forEach((r) => {
      console.log(`ID ${r.id}:`);
      console.log(`  Title: ${r.title}`);
      console.log(`  URL: ${r.url}`);
      console.log(`  Current imageUrl: ${r.currentImageUrl || '(none)'}`);
      console.log(`  Fetched imageUrl: ${r.imageUrl || '(not found)'}`);
      if (r.error) {
        console.log(`  Error: ${r.error}`);
      }
      console.log('');
    });

    // Output as JSON for easy copy-paste
    console.log('='.repeat(70));
    console.log('JSON OUTPUT');
    console.log('='.repeat(70));
    console.log(JSON.stringify(results, null, 2));
    console.log('');

    // Instructions
    console.log('='.repeat(70));
    console.log('NEXT STEPS');
    console.log('='.repeat(70));
    console.log('1. Review the imageUrl values above');
    console.log('2. Test image URLs in your browser to verify they load');
    console.log(
      '3. Open public/data/*/press.json and add browser-safe imageUrl fields to items with IDs:'
    );
    results
      .filter((r) => r.imageUrl && isBrowserSafeImageUrl(r.imageUrl))
      .forEach((r) => {
        console.log(`   - ID ${r.id}: Add imageUrl: "${r.imageUrl}"`);
      });
    const unsafeResults = results.filter((r) => r.imageUrl && !isBrowserSafeImageUrl(r.imageUrl));
    if (unsafeResults.length > 0) {
      console.log('4. Do not paste these fetched URLs directly; cache or replace them first:');
      unsafeResults.forEach((r) => {
        console.log(`   - ID ${r.id}: ${r.imageUrl}`);
      });
    }
    console.log('5. Run: pnpm build');
    console.log('6. Test locally: pnpm start');
    console.log('7. Commit and push changes');
    console.log('');
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
};

// Run the script
run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
