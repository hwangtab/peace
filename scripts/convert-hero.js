const sharp = require('sharp');
const path = require('path');

async function convertHeroToWebP() {
  try {
    const inputPath = path.join(__dirname, '../public/hero-bg.jpg');
    const outputPath = path.join(__dirname, '../public/hero-bg.webp');

    console.log('Converting hero-bg.jpg to WebP...');

    await sharp(inputPath)
      .webp({ quality: 80 }) // 품질 설정 (0-100)
      .toFile(outputPath);

    console.log('Conversion completed successfully!');
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

convertHeroToWebP();
