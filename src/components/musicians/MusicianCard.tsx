import { motion } from 'framer-motion';
import { useState } from 'react';
import { Musician } from '../../types/musician';
import MusicianModal from './MusicianModal';

interface MusicianCardProps {
  musician: Musician;
  index: number;
}

const MusicianCard = ({ musician, index }: MusicianCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 약간의 딜레이를 두고 순차적으로 창 열기
    musician.instagramUrls.forEach((url, index) => {
      setTimeout(() => {
        window.open(url, '_blank');
      }, index * 100); // 각 창을 100ms 간격으로 열기
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="transform-gpu h-full"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl h-full flex flex-col">
          {/* Image */}
          <div className="relative w-full pb-[66.666%]">
            <div className="absolute inset-0 overflow-hidden">
              {musician.imageUrl ? (
                <img
                  src={musician.imageUrl}
                  alt={musician.name}
                  className="absolute w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  loading="eager"
                />
              ) : (
                <div className="absolute w-full h-full flex items-center justify-center text-sage-gray">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-2xl font-serif text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
              {musician.name}
            </h3>
            <p className="text-gray-600 mb-4 flex-1">{musician.shortDescription}</p>
            
            {/* Instagram Links */}
            {musician.instagramUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {musician.instagramUrls.map((url, idx) => {
                  // 인스타그램 URL에서 사용자명 추출
                  const username = url.split('instagram.com/')[1]?.replace(/\/$/, '') || url;
                  return (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      @{username}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Track Title */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">수록곡</p>
              <p className="text-deep-sage font-medium">{musician.trackTitle}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <MusicianModal
        musician={musician}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default MusicianCard;
