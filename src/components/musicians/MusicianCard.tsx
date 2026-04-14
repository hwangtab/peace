import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Musician } from '@/types/musician';
import { extractInstagramUsername } from '@/utils/instagram';
import InstagramIcon from '../icons/InstagramIcon';
import YouTubeIcon from '../icons/YouTubeIcon';

interface MusicianCardProps {
  musician: Musician;
  index: number;
  href?: string;
}

const MusicianCard = memo(({ musician, index, href }: MusicianCardProps) => {
  const detailHref = href || `/album/musicians/${musician.id}`;
  return (
    <>
      <motion.div
        id={`musician-${musician.id}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4 }}
        className="transform-gpu h-full scroll-mt-24"
      >
        <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
          {/* Image */}
          <Link href={detailHref} className="block relative w-full pb-[100%] flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-lg" aria-label={musician.name} tabIndex={-1}>
            <div className="absolute inset-0 overflow-hidden">
              {musician.imageUrl ? (
                <Image
                  src={musician.imageUrl}
                  alt={musician.genre && musician.genre.length > 0 ? `${musician.name} — ${musician.genre[0]}` : musician.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  priority={index < 4}
                />
              ) : (
                <div className="absolute w-full h-full flex items-center justify-center text-coastal-gray">
                  <svg
                    aria-hidden="true"
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
          </Link>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <Link href={detailHref} className="block mb-2 hover:text-ocean-mist transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded">
              <h3 className="text-2xl font-serif text-jeju-ocean group-hover:text-ocean-mist transition-colors duration-200 break-words">
                {musician.name}
              </h3>
            </Link>
            <p className="text-gray-600 mb-4 flex-1 text-pretty break-words">{musician.shortDescription}</p>

            {/* Social Links */}
            {(musician.instagramUrls.length > 0 || musician.youtubeUrl) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {musician.instagramUrls.map((url) => {
                  const username = extractInstagramUsername(url);
                  return (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-200 max-w-full min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded"
                    >
                      <InstagramIcon aria-hidden="true" className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">@{username}</span>
                    </a>
                  );
                })}
                {musician.youtubeUrl && (
                  <a
                    href={musician.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded"
                  >
                    <YouTubeIcon aria-hidden="true" className="w-4 h-4 mr-1" />YouTube
                  </a>
                )}
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </>
  );
});

MusicianCard.displayName = 'MusicianCard';

export default MusicianCard;
