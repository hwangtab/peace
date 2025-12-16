import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  // 이미지 정보 (유연하게 처리)
  image: string | { url: string; alt?: string };

  // 닫기 콜백
  onClose: () => void;

  // 커스터마이징 (선택)
  variant?: 'simple' | 'animated'; // 기본값: 'animated'
  maxHeight?: string; // 기본값: '90vh'
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  image,
  onClose,
  variant = 'animated',
  maxHeight = '90vh'
}) => {
  // 이미지 URL과 alt 텍스트 추출
  const imageUrl = typeof image === 'string' ? image : image.url;
  const altText = typeof image === 'string' ? 'Lightbox image' : (image.alt || 'Lightbox image');

  // ESC 키 처리
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  // 애니메이션 variants (CampGallery 스타일)
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const imageVariants = {
    hidden: { scale: 0.9 },
    visible: { scale: 1 },
    exit: { scale: 0.9 }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.img
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={imageVariants}
          transition={{ duration: 0.2 }}
          src={imageUrl}
          alt={altText}
          className="max-w-full rounded-lg shadow-2xl"
          style={{ maxHeight }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* 닫기 버튼 */}
        <button
          className="absolute top-8 right-8 text-white text-4xl font-light hover:text-jeju-ocean transition-colors"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;
