const fs = require('fs');
const path = require('path');

// Helper: shuffle array for random selection
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate for each camp year with fixed 20 images
function generateImagesForYear(year, count = 20) {
  const imagesDir = path.join(__dirname, `../public/images-webp/camps/${year}`);

  // Read all available files
  const allFiles = fs.readdirSync(imagesDir)
    .filter(file => file.endsWith('.webp'))
    .sort();

  // Randomly select images
  const shuffled = shuffleArray(allFiles);
  const selected = shuffled.slice(0, count);

  console.log(`\n=== ${year} Camp ===`);
  console.log(`Available: ${allFiles.length}, Selected: ${selected.length}`);
  console.log(`Files: ${selected.slice(0, 5).join(', ')}...`);
  console.log('');

  // Generate image objects with IDs
  const startId = year === 2023 ? 101 : 201;
  const newImages = selected.map((file, index) => ({
    id: startId + index,
    url: `/images-webp/camps/${year}/${file}`,
    eventType: 'camp',
    eventYear: year
  }));

  return newImages;
}

// Generate for both years
const images2023 = generateImagesForYear(2023, 20);
const images2025 = generateImagesForYear(2025, 20);

// Output TypeScript code
console.log('='.repeat(70));
console.log('COPY & PASTE TO src/data/gallery.ts');
console.log('='.repeat(70));
console.log('');

console.log('// 2023 Camp Images');
console.log('const camp2023Images: GalleryImages = [');
images2023.forEach(img => {
  console.log(`  { id: ${img.id}, url: '${img.url}', eventType: '${img.eventType}', eventYear: ${img.eventYear} },`);
});
console.log('];');
console.log('');

console.log('// 2025 Camp Images');
console.log('const camp2025Images: GalleryImages = [');
images2025.forEach(img => {
  console.log(`  { id: ${img.id}, url: '${img.url}', eventType: '${img.eventType}', eventYear: ${img.eventYear} },`);
});
console.log('];');
console.log('');

console.log('='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`2023 images: ${images2023.length}`);
console.log(`2025 images: ${images2025.length}`);
console.log(`Total: ${images2023.length + images2025.length} images`);
