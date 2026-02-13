import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CampEvent } from '../../types/camp';

interface CampCardProps {
  camp: CampEvent;
}

const CampCard: React.FC<CampCardProps> = React.memo(({ camp }) => {
  const { t } = useTranslation();
  const isComingSoon = camp.year === 2026;
  const cardContent = (
    <>
      <div className="bg-gradient-to-b from-jeju-ocean to-ocean-mist h-48 flex flex-col items-center justify-center p-4 text-center">
        <h3 className="typo-h2 text-white mb-2">
          {camp.year}
        </h3>
        <p className="typo-h3 text-white mb-4 text-balance break-words">{camp.title}</p>
        {isComingSoon && (
          <span className="bg-white text-jeju-ocean px-4 py-2 rounded-full text-sm font-semibold">
            {t('camp.coming_soon')}
          </span>
        )}
      </div>

      <div className="bg-white p-6">
        <p className="text-gray-700 mb-4 leading-relaxed text-pretty break-words">
          {camp.description}
        </p>

        {!isComingSoon && (
          <>
            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">📅 {t('camp.label_period')}:</span> {camp.startDate}
                {camp.endDate && ` ~ ${camp.endDate}`}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">📍 {t('camp.label_location')}:</span> {camp.location}
              </p>
            </div>

            {camp.participants && camp.participants.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  {t('camp.label_participants')} ({camp.participants.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {camp.participants.slice(0, 3).map((participant) => {
                    const name = typeof participant === 'string' ? participant : participant.name;
                    return (
                      <span
                        key={name}
                        className="bg-ocean-sand text-jeju-ocean px-2 py-1 rounded text-xs font-medium"
                      >
                        {name}
                      </span>
                    );
                  })}
                  {camp.participants.length > 3 && (
                    <span className="bg-ocean-sand text-jeju-ocean px-2 py-1 rounded text-xs font-medium">
                      +{camp.participants.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="w-full inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg bg-jeju-ocean text-white hover:bg-ocean-mist px-6 py-2 text-sm">
              {t('camp.view_detail')}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      whileHover={!isComingSoon ? {
        y: -8,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      } : {}}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {isComingSoon ? (
        <div className="block h-full rounded-lg overflow-hidden shadow-md">
          {cardContent}
        </div>
      ) : (
        <Link
          href={`/camps/${camp.year}`}
          className="block h-full rounded-lg overflow-hidden shadow-md"
        >
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
});

CampCard.displayName = 'CampCard';

export default CampCard;
