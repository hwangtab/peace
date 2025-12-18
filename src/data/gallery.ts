import { GalleryImages } from '../types/gallery';

/**
 * Note: Static image metadata has been moved to public/data/gallery/*.json for performance.
 * This file is now primarily for type definitions or legacy compatibility if needed.
 */

const albumImages: GalleryImages = [];
const camp2023Images: GalleryImages = [];
const camp2025Images: GalleryImages = [];

export const galleryImages: GalleryImages = [
  ...albumImages,
  ...camp2023Images,
  ...camp2025Images
];
