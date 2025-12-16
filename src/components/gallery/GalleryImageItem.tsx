import { useState } from 'react';
import { GalleryImage } from '../../types/gallery';

interface GalleryImageItemProps {
    image: GalleryImage;
    priority?: boolean;
    onClick: (image: GalleryImage) => void;
}

const GalleryImageItem = ({ image, priority = false, onClick }: GalleryImageItemProps) => {
    // Isolate loading state to this component only
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            className="cursor-pointer group h-full"
            onClick={() => onClick(image)}
        >
            <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                )}
                <img
                    src={image.url}
                    alt={image.description || `Gallery image ${image.id}`}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading={priority ? "eager" : "lazy"}
                    onLoad={() => setIsLoaded(true)}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

                {/* Optional: Add Description Overlay if needed, consistent with restoring features */}
                {image.description && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <p className="text-white text-sm font-medium truncate">{image.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryImageItem;
