export interface ResponsiveImagePaths {
  mobile: string;
  tablet: string;
  desktop: string;
  original: string;
}

export const getResponsiveImagePath = (imagePath: string): ResponsiveImagePaths => {
  const basePath = imagePath.replace('.webp', '');
  return {
    mobile: `${basePath}-mobile.webp`,
    tablet: `${basePath}-tablet.webp`,
    desktop: `${basePath}-desktop.webp`,
    original: imagePath,
  };
};
