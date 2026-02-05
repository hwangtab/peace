import React, { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { Musician } from '../../types/musician';
import { extractInstagramUsername } from '../../utils/instagram';
import MusicianModal from './MusicianModal';
import InstagramIcon from '../icons/InstagramIcon';

interface MusicianCardProps {
  musician: Musician;
  index: number;
}

const MusicianCard = memo(({ musician, index }: MusicianCardProps) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <motion.div
        id={`musician-${musician.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="transform-gpu h-full scroll-mt-24"
        onClick={handleOpenModal}
      >
        <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl h-full flex flex-col">
          {/* Image */}
          <div className="relative w-full pb-[66.666%]">
            <div className="absolute inset-0 overflow-hidden">
              {musician.imageUrl ? (
                <Image
                  src={musician.imageUrl}
                  alt={musician.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  priority={index < 4}
                />
              ) : (
                <div className="absolute w-full h-full flex items-center justify-center text-coastal-gray">
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
            <h3 className="text-2xl font-serif text-jeju-ocean group-hover:text-ocean-mist transition-colors duration-200 mb-2 break-words">
              {musician.name}
            </h3>
            <p className="text-gray-600 mb-4 flex-1 text-pretty break-words">{musician.shortDescription}</p>

            {/* Instagram Links */}
            {musician.instagramUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {musician.instagramUrls.map((url) => {
                  const username = extractInstagramUsername(url);
                  return (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-200"
                    >
                      <InstagramIcon className="w-4 h-4 mr-1" />@{username}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Track Title */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">{t('common.featured_track')}</p>
              <p className="text-jeju-ocean font-medium">{musician.trackTitle}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <MusicianModal musician={musician} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
});

MusicianCard.displayName = 'MusicianCard';

export default MusicianCard;
