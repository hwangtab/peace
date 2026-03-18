const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Target musician IDs and their image URLs
const MUSICIANS = {
  17: 'https://image.bugsm.co.kr/album/images/500/205313/20531325.jpg',
  20: 'https://kprofiles.com/wp-content/uploads/2020/08/Mgz_Main_Top_20160218193236.jpg',
  25: 'https://i.ytimg.com/vi/fp1kFyL6AxQ/hq720.jpg',
  30: 'https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/014/937/608/14937608_4_600x600.JPG',
  31: 'https://ojsfile.ohmynews.com/STD_IMG_FILE/2023/1206/IE003236477_STD.jpg',
  32: 'https://ojsfile.ohmynews.com/CT_T_IMG/2017/0819/IE002205318_LT.jpg',
  33: 'https://lh5.googleusercontent.com/proxy/oX_irhtfpzHmEbGR-AKKrMIJT1I1WAYuj4G75Vm2eiiotqz8tQjEm9pvuiGx2pmme0TPvoRXIlNlzwaZepyd1LleYzADR1W4PgXDZfShmR-pRdp_cfc94-otTp44lDAZFzrkZIiVF_Y',
  34: 'https://i3.ruliweb.com/img/25/04/08/19613ee8904afd4.jpeg',
  39: 'https://image.bugsm.co.kr/artist/images/200/200905/20090589.jpg',
  42: 'https://image.bugsm.co.kr/artist/images/200/800739/80073984.jpg',
  44: 'https://img.khan.co.kr/newsmaker/1354/1354_38.jpg',
  45: 'https://ojsfile.ohmynews.com/STD_IMG_FILE/2019/0711/IE002521195_STD.jpg',
  48: 'https://cdn.jejusori.net/news/photo/201003/77655_84499_4920.jpg',
  50: 'https://i.ytimg.com/vi/kcASkP7C0CM/maxresdefault.jpg',
  52: 'https://i.ytimg.com/vi/HAm1Jg1LZkY/hq720.jpg',
  55: 'https://image.bugsm.co.kr/artist/images/224/200649/20064990.jpg',
  56: 'https://theplay.or.kr/wp-content/uploads/포크송-가수-황명하-8.jpg',
  58: 'https://mblogthumb-phinf.pstatic.net/MjAyMzA5MjRfMTYw/MDAxNjk1NTM5NDg5MTU0.hfy0_56rmwIGsFMtySOw6HPX4F_ywdJMFB0CR3t6jGcg.57jZOi-BeYm4Gf4kl3UTl0nEbHGIao9fa_B6GqCcvAsg.JPEG.minjow1996/IMG_20230924_155512_094.jpg?type=w800',
};

const OUTPUT_DIR = 'public/images-webp/musicians';
const TEMP_DIR = '.tmp-musician-downloads';
const QUALITY = 85;

// User-Agent to avoid bot blocking
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(
      url,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'image/*',
        },
        timeout: 10000,
        maxRedirects: 5,
      },
      (response) => {
        // Check for redirect or error status
        if (response.statusCode >= 400) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          fs.writeFile(outputPath, buffer)
            .then(() => resolve(buffer.length))
            .catch(reject);
        });
      }
    );

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function isValidImage(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size < 1024) {
      return false; // Less than 1KB
    }

    // Try to read with sharp to validate it's a real image
    const metadata = await sharp(filePath).metadata();
    return metadata && metadata.width && metadata.height;
  } catch (error) {
    return false;
  }
}

async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({
        quality: QUALITY,
        effort: 4,
      })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    return stats.size;
  } catch (error) {
    throw new Error(`WebP conversion failed: ${error.message}`);
  }
}

async function processMusician(id, url) {
  const outputWebP = path.join(OUTPUT_DIR, `${id}.webp`);
  const tempFile = path.join(TEMP_DIR, `${id}-temp`);

  try {
    // Check if output already exists
    try {
      await fs.stat(outputWebP);
      console.log(`  ⏭️  ID ${id}: Already exists, skipping`);
      return { id, status: 'skipped', reason: 'already_exists' };
    } catch {
      // File doesn't exist, continue
    }

    // Download
    console.log(`  ⬇️  ID ${id}: Downloading...`);
    const downloadedSize = await downloadFile(url, tempFile);
    console.log(`     Downloaded: ${(downloadedSize / 1024).toFixed(1)} KB`);

    // Validate
    const isValid = await isValidImage(tempFile);
    if (!isValid) {
      throw new Error('Downloaded file is not a valid image or too small');
    }

    // Convert to WebP
    console.log(`  🔄 ID ${id}: Converting to WebP...`);
    const webpSize = await convertToWebP(tempFile, outputWebP);
    console.log(`  ✅ ID ${id}: Success (${(webpSize / 1024).toFixed(1)} KB)`);

    // Cleanup temp file
    await fs.unlink(tempFile).catch(() => {});

    return { id, status: 'success', size: webpSize };
  } catch (error) {
    console.error(`  ❌ ID ${id}: ${error.message}`);

    // Cleanup temp file
    await fs.unlink(tempFile).catch(() => {});

    return { id, status: 'failed', error: error.message };
  }
}

async function main() {
  console.log('🎵 Downloading Musician Images');
  console.log('================================\n');

  try {
    // Create directories
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });

    const results = [];
    const ids = Object.keys(MUSICIANS)
      .map(Number)
      .sort((a, b) => a - b);

    console.log(`Processing ${ids.length} musicians...\n`);

    for (const id of ids) {
      const url = MUSICIANS[id];
      const result = await processMusician(id, url);
      results.push(result);
    }

    // Cleanup temp directory
    await fs.rm(TEMP_DIR, { recursive: true, force: true });

    // Summary
    console.log('\n================================');
    console.log('📊 SUMMARY');
    console.log('================================');

    const successful = results.filter((r) => r.status === 'success');
    const failed = results.filter((r) => r.status === 'failed');
    const skipped = results.filter((r) => r.status === 'skipped');

    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`⏭️  Skipped: ${skipped.length}`);

    if (failed.length > 0) {
      console.log('\nFailed IDs:');
      failed.forEach((r) => console.log(`  - ID ${r.id}: ${r.error}`));
    }

    console.log('\n✨ Download complete!\n');

    // Save evidence
    const evidenceDir = '.sisyphus/evidence';
    await fs.mkdir(evidenceDir, { recursive: true });

    // Save verification report
    const verificationReport = `# Image Download Verification Report
Generated: ${new Date().toISOString()}

## Summary
- Total processed: ${results.length}
- Successful: ${successful.length}
- Failed: ${failed.length}
- Skipped: ${skipped.length}

## Successful Downloads
${successful.map((r) => `- ID ${r.id}: ${(r.size / 1024).toFixed(1)} KB`).join('\n')}

## Failed Downloads
${failed.length > 0 ? failed.map((r) => `- ID ${r.id}: ${r.error}`).join('\n') : 'None'}

## Skipped
${skipped.length > 0 ? skipped.map((r) => `- ID ${r.id}: ${r.reason}`).join('\n') : 'None'}
`;

    await fs.writeFile(
      path.join(evidenceDir, 'task-1-image-download-verify.txt'),
      verificationReport
    );

    // Save download log
    const downloadLog = `# Download Log
Generated: ${new Date().toISOString()}

${results
  .map((r) => {
    if (r.status === 'success') {
      return `[SUCCESS] ID ${r.id}: ${(r.size / 1024).toFixed(1)} KB`;
    } else if (r.status === 'failed') {
      return `[FAILED] ID ${r.id}: ${r.error}`;
    } else {
      return `[SKIPPED] ID ${r.id}: ${r.reason}`;
    }
  })
  .join('\n')}
`;

    await fs.writeFile(path.join(evidenceDir, 'task-1-download-log.txt'), downloadLog);

    console.log(`📝 Evidence saved to ${evidenceDir}/`);

    process.exit(failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
