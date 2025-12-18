import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CampEvent } from '../../types/camp';
import Button from '../common/Button';

interface CampCardProps {
  camp: CampEvent;
}

const CampCard: React.FC<CampCardProps> = ({ camp }) => {
  const isComingSoon = camp.year === 2026;

  return (
    <motion.div
      whileHover={!isComingSoon ? { y: -8 } : {}}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link
        to={isComingSoon ? '#' : `/camps/${camp.year}`}
        className={`block h-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ${isComingSoon ? 'pointer-events-none' : ''
          }`}
      >
        <div className="bg-gradient-to-b from-jeju-ocean to-ocean-mist h-48 flex flex-col items-center justify-center p-4 text-center">
          <h3 className="typo-h2 text-white mb-2">
            {camp.year}
          </h3>
          <p className="typo-h3 text-white mb-4">{camp.title}</p>
          {isComingSoon && (
            <span className="bg-white text-jeju-ocean px-4 py-2 rounded-full text-sm font-semibold">
              Coming Soon
            </span>
          )}
        </div>

        <div className="bg-white p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            {camp.description}
          </p>

          {!isComingSoon && (
            <>
              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">📅 기간:</span> {camp.startDate}
                  {camp.endDate && ` ~ ${camp.endDate}`}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">📍 장소:</span> {camp.location}
                </p>
              </div>

              {camp.participants && camp.participants.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    참여자 ({camp.participants.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {camp.participants.slice(0, 3).map((participant, index) => {
                      const name = typeof participant === 'string' ? participant : participant.name;
                      return (
                        <span
                          key={index}
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

              <Button
                variant="primary"
                size="sm"
                fullWidth
              >
                자세히 보기
              </Button>
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default CampCard;
