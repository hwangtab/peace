const ogs = require('open-graph-scraper');
const fs = require('fs');
const path = require('path');

// Config
const FETCH_DELAY_MS = 1000; // Rate limiting (1 second between requests)
const REQUEST_TIMEOUT_MS = 10000; // 10 second timeout per request

/**
 * Load press items from TypeScript data file using dynamic import
 * @returns {Array} Array of press items
 */
const loadPressData = async () => {
  const pressFilePath = path.join(__dirname, '../src/data/press.ts');

  try {
    // Try to use dynamic import with ts-node if available
    // For now, we'll try a regex-based extraction that's more robust
    const content = fs.readFileSync(pressFilePath, 'utf-8');

    // Find the press items array more carefully
    // Pattern: export const pressItems: PressItem[] = ([...] as PressItem[])
    const arrayMatch = content.match(/export const pressItems: PressItem\[\] = \(\[([\s\S]*?)\] as PressItem\[\]\)/);

    if (!arrayMatch) {
      throw new Error('Could not find pressItems array in press.ts');
    }

    // Parse individual objects manually to avoid JSON parsing issues
    const arrayContent = arrayMatch[1];
    const items = [];

    // Match each object: { ... }
    // Use a recursive approach to handle nested braces
    let depth = 0;
    let currentObj = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];
      const prevChar = i > 0 ? arrayContent[i - 1] : '';

      // Handle string boundaries
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '{') {
          depth++;
          currentObj += char;
        } else if (char === '}') {
          currentObj += char;
          depth--;

          if (depth === 0 && currentObj.trim().length > 2) {
            // We have a complete object
            try {
              const obj = parseObjectString(currentObj);
              items.push(obj);
            } catch (e) {
              console.warn(`Failed to parse object: ${currentObj.substring(0, 50)}...`);
            }
            currentObj = '';
          }
        } else if (depth > 0) {
          currentObj += char;
        }
      } else {
        currentObj += char;
      }
    }

    if (items.length === 0) {
      throw new Error('No items parsed from press data');
    }

    return items;
  } catch (error) {
    console.error('Error loading press data:', error.message);
    throw error;
  }
};

/**
 * Parse a single object string from TypeScript format to JavaScript object
 * @param {string} objStr - Object string like: { id: 1, title: "...", ... }
 * @returns {Object} Parsed object
 */
function parseObjectString(objStr) {
  // Convert TypeScript object syntax to JSON
  let jsonStr = objStr;

  // First, escape any unescaped quotes inside string values
  // This is tricky, so we'll use a state machine approach
  let result = '';
  let inString = false;
  let stringChar = '';
  let i = 0;

  while (i < jsonStr.length) {
    const char = jsonStr[i];
    const nextChar = i + 1 < jsonStr.length ? jsonStr[i + 1] : '';
    const prevChar = i > 0 ? jsonStr[i - 1] : '';

    // Detect string boundaries
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
        // Convert single quotes to double quotes for JSON compatibility
        result += '"';
        i++;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
        result += '"';
        i++;
      } else {
        result += char;
        i++;
      }
    } else if (inString) {
      // Inside a string - escape double quotes that aren't already escaped
      if (char === '"' && prevChar !== '\\') {
        result += '\\"';
      } else if (char === '\\' && nextChar === '"') {
        // Already escaped, keep it
        result += '\\' + nextChar;
        i += 2;
      } else {
        result += char;
        i++;
      }
    } else {
      result += char;
      i++;
    }
  }

  jsonStr = result;

  // Now handle TypeScript syntax conversion
  // Match and replace property names that are unquoted
  // Match: word: (not preceded by quote or bracket)
  jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_]\w*)(\s*:)/g, '$1"$2"$3');

  // Handle trailing commas
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

  // Parse as JSON
  return JSON.parse(jsonStr);
}

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
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }
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
        error: ogsError
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
      currentImageUrl: pressItem.imageUrl || ''
    };
  } catch (error) {
    console.error(`  ✗ Exception for ID ${pressItem.id}: ${error.message}`);
    return {
      id: pressItem.id,
      title: pressItem.title,
      url: pressItem.url,
      imageUrl: '',
      currentImageUrl: pressItem.imageUrl || '',
      error: error.message
    };
  }
};

/**
 * Sleep utility for rate limiting
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main execution
 */
const run = async () => {
  console.log('='.repeat(70));
  console.log('Press Article Thumbnail Fetcher');
  console.log('='.repeat(70));
  console.log('');

  try {
    // Load press data (now async)
    const pressData = await loadPressData();
    console.log(`Loaded ${pressData.length} press items\n`);

    // Determine fetch mode
    const fetchAll = process.argv.includes('--all');
    const itemsToFetch = fetchAll
      ? pressData
      : pressData.filter(p => !p.imageUrl);

    console.log(`Mode: ${fetchAll ? 'ALL ARTICLES' : 'MISSING ONLY'}`);
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
    console.log(`Found images: ${results.filter(r => r.imageUrl).length}`);
    console.log(`Missing images: ${results.filter(r => !r.imageUrl).length}`);
    console.log(`Errors: ${results.filter(r => r.error).length}`);

    // Output detailed results for manual review
    console.log('\n' + '='.repeat(70));
    console.log('DETAILED RESULTS - Copy imageUrl values to press.ts');
    console.log('='.repeat(70));
    console.log('');

    results.forEach(r => {
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
    console.log('3. Open src/data/press.ts and add imageUrl field to items with IDs:');
    results
      .filter(r => r.imageUrl)
      .forEach(r => {
        console.log(`   - ID ${r.id}: Add imageUrl: "${r.imageUrl}"`);
      });
    console.log('4. Run: npm run build');
    console.log('5. Test locally: npm start');
    console.log('6. Commit and push changes');
    console.log('');

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
};

// Run the script
run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
