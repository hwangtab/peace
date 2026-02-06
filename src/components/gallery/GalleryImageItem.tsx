import React, { useState } from 'react';
import Image from 'next/image';
import { GalleryImage } from '../../types/gallery';

interface GalleryImageItemProps {
    image: GalleryImage;
    priority?: boolean;
    onClick: (image: GalleryImage) => void;
}

const GalleryImageItem = React.memo(({ image, priority = false, onClick }: GalleryImageItemProps) => {
    // Isolate loading state to this component only
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            className="cursor-pointer group h-full"
            onClick={() => onClick(image)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(image); } }}
            role="button"
            tabIndex={0}
        >
            <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Skeleton pulse - only shown while not loaded */}
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg z-0" />
                )}

                <Image
                    src={image.url}
                    alt={image.description || `Gallery image ${image.id}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={`object-cover transition-all duration-700 ease-in-out group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    priority={priority}
                    loading={priority ? 'eager' : 'lazy'}
                    onLoadingComplete={() => setIsLoaded(true)}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </div>
        </div>
    );
});

GalleryImageItem.displayName = 'GalleryImageItem';

export default GalleryImageItem;
