import { motion } from 'framer-motion';
import { useState } from 'react';
import { GalleryImage } from '../../types/gallery';

interface GalleryImageItemProps {
    image: GalleryImage;
    index: number;
    priority?: boolean;
    onClick: (image: GalleryImage) => void;
}

const GalleryImageItem = ({ image, index, priority = false, onClick }: GalleryImageItemProps) => {
    // Isolate loading state to this component only
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (index % 12) * 0.05 }}
            className="cursor-pointer group"
            onClick={() => onClick(image)}
        >
            <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-100">
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                )}
                <img
                    src={image.url}
                    alt={image.description || `Gallery image ${image.id}`}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading={priority ? "eager" : "lazy"}
                    onLoad={() => setIsLoaded(true)}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
        </motion.div>
    );
};

export default GalleryImageItem;
