import { GalleryImage } from '../types/gallery';
import { galleryImages } from '../data/gallery';

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  return galleryImages;
};
