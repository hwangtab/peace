const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const config = {
  types: {
    gallery: {
      inputDir: 'public/Images/album',
      outputDir: 'public/images-webp/gallery',
      quality: 85,
      fileRange: { start: 1, end: 180 },
      inputExt: '.jpeg',
      description: 'Gallery images'
    },
    musicians: {
      inputDir: 'public/Images/album/musicians',
      outputDir: 'public/images-webp/musicians',
      quality: 85,
      fileRange: { start: 1, end: 12 },
      inputExt: '.jpg',
      description: 'Musician profiles'
    },
    camp2023: {
      inputDir: 'public/Images/1th camp',
      outputDir: 'public/images-webp/camps/2023',
      quality: 75,
      preserveFilename: true,
      description: '2023 Camp photos'
    },
    camp2025: {
      inputDir: 'public/Images/2th camp',
      outputDir: 'public/images-webp/camps/2025',
      quality: 75,
      preserveFilename: true,
      description: '2025 Camp photos'
    }
  }
};

async function convertImageSet(typeConfig, typeName) {
  const startTime = Date.now();
  let converted = 0;
  let errors = 0;
  let originalSize = 0;
  let newSize = 0;

  console.log(`\n📸 Converting ${typeConfig.description}...`);

  try {
    // Create output directory
    await fs.mkdir(typeConfig.outputDir, { recursive: true });

    let filesToConvert = [];

    // Handle numbered files (gallery, musicians)
    if (typeConfig.fileRange) {
      const { start, end } = typeConfig.fileRange;
      for (let i = start; i <= end; i++) {
        const inputFile = path.join(typeConfig.inputDir, `${i}${typeConfig.inputExt}`);
        filesToConvert.push({
          input: inputFile,
          output: path.join(typeConfig.outputDir, `${i}.webp`),
          filename: `${i}${typeConfig.inputExt}`
        });
      }
    }
    // Handle directory scanning (camps)
    else if (typeConfig.preserveFilename) {
      try {
        const files = await fs.readdir(typeConfig.inputDir);
        const imageFiles = files.filter(f =>
          /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(f) && !f.startsWith('._')
        );

        filesToConvert = imageFiles.map(file => ({
          input: path.join(typeConfig.inputDir, file),
          output: path.join(typeConfig.outputDir, `${path.parse(file).name}.webp`),
          filename: file
        }));
      } catch (error) {
        console.error(`  ❌ Error reading directory ${typeConfig.inputDir}: ${error.message}`);
        return { converted: 0, errors: 1, originalSize: 0, newSize: 0 };
      }
    }

    const total = filesToConvert.length;

    if (total === 0) {
      console.log(`  ⚠️  No images found in ${typeConfig.inputDir}`);
      return { converted: 0, errors: 0, originalSize: 0, newSize: 0 };
    }

    // Convert images
    for (let i = 0; i < filesToConvert.length; i++) {
      const { input, output, filename } = filesToConvert[i];

      try {
        // Check if input file exists
        const inputStats = await fs.stat(input);
        originalSize += inputStats.size;

        // Convert
        await sharp(input)
          .webp({
            quality: typeConfig.quality,
            effort: 4
          })
          .toFile(output);

        // Get new size
        const outputStats = await fs.stat(output);
        newSize += outputStats.size;

        converted++;

        // Progress indicator
        if (converted % 50 === 0 || converted === total) {
          const percent = ((converted / total) * 100).toFixed(1);
          process.stdout.write(`\r  Progress: ${converted}/${total} (${percent}%)`);
        }
      } catch (error) {
        errors++;
        console.error(`\n  ❌ Error converting ${filename}: ${error.message}`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const originalMB = (originalSize / 1024 / 1024).toFixed(2);
    const newMB = (newSize / 1024 / 1024).toFixed(2);
    const reduction = originalSize > 0 ? ((1 - newSize / originalSize) * 100).toFixed(1) : 0;

    console.log(`\n  ✅ Completed in ${duration}s`);
    console.log(`  Original: ${originalMB} MB`);
    console.log(`  Converted: ${newMB} MB`);
    console.log(`  Saved: ${reduction}%`);

    if (errors > 0) {
      console.log(`  ⚠️  Errors: ${errors}`);
    }

    return { converted, errors, originalSize, newSize };

  } catch (error) {
    console.error(`  ❌ Failed to process ${typeName}:`, error);
    return { converted: 0, errors: 1, originalSize: 0, newSize: 0 };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const isFull = args.includes('--full');

  console.log('🎨 Peace & Music Image Optimization');
  console.log('====================================');

  if (isTest) {
    console.log('⚠️  TEST MODE - Converting first 10 images only\n');
    config.types.gallery.fileRange.end = 10;
    config.types.musicians.fileRange.end = 2;
  } else if (!isFull) {
    console.log('Usage:');
    console.log('  node scripts/convert-images-optimized.js --test   (test mode: 10 images)');
    console.log('  node scripts/convert-images-optimized.js --full   (full conversion)\n');
    process.exit(1);
  }

  const results = {
    totalConverted: 0,
    totalErrors: 0,
    totalOriginalSize: 0,
    totalNewSize: 0,
    startTime: Date.now()
  };

  // Convert each type
  for (const [typeName, typeConfig] of Object.entries(config.types)) {
    const result = await convertImageSet(typeConfig, typeName);
    results.totalConverted += result.converted;
    results.totalErrors += result.errors;
    results.totalOriginalSize += result.originalSize;
    results.totalNewSize += result.newSize;
  }

  // Summary
  console.log('\n====================================');
  console.log('📊 SUMMARY');
  console.log('====================================');
  console.log(`Total images converted: ${results.totalConverted}`);
  console.log(`Errors: ${results.totalErrors}`);

  const originalGB = (results.totalOriginalSize / 1024 / 1024 / 1024).toFixed(2);
  const newGB = (results.totalNewSize / 1024 / 1024 / 1024).toFixed(2);
  const reduction = results.totalOriginalSize > 0
    ? ((1 - results.totalNewSize / results.totalOriginalSize) * 100).toFixed(1)
    : 0;

  console.log(`Original size: ${originalGB} GB`);
  console.log(`New size: ${newGB} GB`);
  console.log(`Space saved: ${reduction}%`);

  const totalTime = ((Date.now() - results.startTime) / 1000).toFixed(1);
  console.log(`Total time: ${totalTime}s`);
  console.log('\n✨ Conversion complete!\n');

  process.exit(results.totalErrors > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
