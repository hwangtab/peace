import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Button from '../../common/Button';
import { GalleryImage } from '@/types/gallery';

interface PhotoTabPanelProps {
    albumPhotos: GalleryImage[];
    onImageClick: (image: GalleryImage) => void;
}

const PhotoTabPanel: React.FC<PhotoTabPanelProps> = ({ albumPhotos, onImageClick }) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
                {albumPhotos.slice(0, 12).map((photo, index) => (
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-[box-shadow,transform] duration-300 hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
                        role="button"
                        aria-label={t('album.image_alt_concert', { num: index + 1 })}
                        tabIndex={0}
                        onClick={() => onImageClick(photo)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onImageClick(photo); } }}
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={photo.url}
                                alt={t('album.image_alt_concert', { num: index + 1 })}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover"
                                loading="lazy"
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="text-center mt-12">
                <Button to="/gallery?filter=album-2024" variant="primary">
                    {t('album.all_photos')}
                </Button>
            </div>
        </>
    );
};

export default PhotoTabPanel;
