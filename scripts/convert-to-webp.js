const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function convertToWebP(inputDir, outputDir) {
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Read all files in the input directory
    const files = await fs.readdir(inputDir);

    // Filter for image files
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );

    // Convert each image
    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);

      console.log(`Converting ${file} to WebP...`);

      await sharp(inputPath)
        .webp({ quality: 80 }) // Adjust quality as needed (0-100)
        .toFile(outputPath);
    }

    console.log('Conversion completed successfully!');
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

// Convert gallery images
convertToWebP(
  path.join(__dirname, '../public/gallery'),
  path.join(__dirname, '../public/gallery-webp')
);

// Convert musician images
convertToWebP(
  path.join(__dirname, '../public/musicians'),
  path.join(__dirname, '../public/musicians-webp')
);
