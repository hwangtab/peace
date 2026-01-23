export interface ResponsiveImagePaths {
  mobile: string;
  tablet: string;
  desktop: string;
  original: string;
  srcSet: string;
  sizes: string;
}

export const getResponsiveImagePath = (imagePath: string): ResponsiveImagePaths => {
  const basePath = imagePath.replace('.webp', '');
  const mobile = `${basePath}-mobile.webp`;
  const tablet = `${basePath}-tablet.webp`;
  const desktop = `${basePath}-desktop.webp`;

  return {
    mobile,
    tablet,
    desktop,
    original: imagePath,
    srcSet: `${mobile} 640w, ${tablet} 1024w, ${desktop} 1920w`,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };
};

/**
 * Generate srcSet and sizes attributes for responsive images
 * @param imagePath - The base image path
 * @param customSizes - Optional custom sizes attribute
 * @returns Object with srcSet and sizes for use in img tags
 */
export const getImageAttributes = (imagePath: string, customSizes?: string) => {
  const paths = getResponsiveImagePath(imagePath);
  return {
    srcSet: paths.srcSet,
    sizes: customSizes || paths.sizes,
    src: paths.original,
  };
};
