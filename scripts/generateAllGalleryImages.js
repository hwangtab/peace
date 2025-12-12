const fs = require('fs');
const path = require('path');

/**
 * Generate all gallery images for gallery.ts
 * Outputs complete arrays for album, camp 2023, and camp 2025
 */

function generateImagesForDirectory(dirPath, baseUrl, idStart, eventType, eventYear) {
  try {
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.webp'))
      .sort();

    const images = files.map((file, index) => ({
      id: idStart + index,
      url: `${baseUrl}${file}`,
      eventType: eventType,
      eventYear: eventYear
    }));

    return images;
  } catch (error) {
    console.error(`Error reading ${dirPath}: ${error.message}`);
    return [];
  }
}

// Generate images for all categories
console.log('='.repeat(80));
console.log('GENERATING ALL GALLERY IMAGES FOR gallery.ts');
console.log('='.repeat(80));
console.log('');

// Album images (1-180)
const albumDir = path.join(__dirname, '../public/images-webp/gallery');
const albumImages = generateImagesForDirectory(albumDir, '/images-webp/gallery/', 1, 'album', 2024);

// Camp 2023 images (101-1207)
const camp2023Dir = path.join(__dirname, '../public/images-webp/camps/2023');
const camp2023Images = generateImagesForDirectory(camp2023Dir, '/images-webp/camps/2023/', 101, 'camp', 2023);

// Camp 2025 images (201-464)
const camp2025Dir = path.join(__dirname, '../public/images-webp/camps/2025');
const camp2025Images = generateImagesForDirectory(camp2025Dir, '/images-webp/camps/2025/', 201, 'camp', 2025);

console.log(`Album images: ${albumImages.length}`);
console.log(`Camp 2023 images: ${camp2023Images.length}`);
console.log(`Camp 2025 images: ${camp2025Images.length}`);
console.log(`Total: ${albumImages.length + camp2023Images.length + camp2025Images.length}`);
console.log('');

// Output TypeScript code
console.log('='.repeat(80));
console.log('COPY & PASTE TO src/data/gallery.ts');
console.log('='.repeat(80));
console.log('');

console.log('// Album Images (Total: ' + albumImages.length + ')');
console.log('const albumImages: GalleryImages = [');
albumImages.forEach(img => {
  console.log(`  { id: ${img.id}, url: '${img.url}', eventType: '${img.eventType}', eventYear: ${img.eventYear} },`);
});
console.log('];');
console.log('');

console.log('// Camp 2023 Images (Total: ' + camp2023Images.length + ')');
console.log('const camp2023Images: GalleryImages = [');
camp2023Images.forEach(img => {
  console.log(`  { id: ${img.id}, url: '${img.url}', eventType: '${img.eventType}', eventYear: ${img.eventYear} },`);
});
console.log('];');
console.log('');

console.log('// Camp 2025 Images (Total: ' + camp2025Images.length + ')');
console.log('const camp2025Images: GalleryImages = [');
camp2025Images.forEach(img => {
  console.log(`  { id: ${img.id}, url: '${img.url}', eventType: '${img.eventType}', eventYear: ${img.eventYear} },`);
});
console.log('];');
console.log('');

console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Total images: ${albumImages.length + camp2023Images.length + camp2025Images.length}`);
console.log(`Album: ${albumImages.length}`);
console.log(`Camp 2023: ${camp2023Images.length}`);
console.log(`Camp 2025: ${camp2025Images.length}`);
console.log('');
