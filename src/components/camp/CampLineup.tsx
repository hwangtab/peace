import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Participant } from '../../types/camp';
import MusicianModal from '../musicians/MusicianModal';
import { Musician } from '../../types/musician';

interface CampLineupProps {
  participants: (string | Participant)[];
  musicians: Musician[];
  inView: boolean;
}

const CampLineup: React.FC<CampLineupProps> = ({ participants, musicians, inView }) => {
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleParticipantClick = React.useCallback((participant: string | Participant) => {
    if (typeof participant === 'object' && participant !== null && participant.musicianId) {
      const musician = musicians.find(m => m.id === participant.musicianId);
      if (musician) {
        setSelectedMusician(musician);
        setIsModalOpen(true);
      }
    }
  }, [musicians]);

  const getParticipantName = (participant: string | Participant) => {
    if (!participant) return '';
    return typeof participant === 'string' ? participant : participant.name;
  };

  const isClickable = (participant: string | Participant) => {
    return typeof participant === 'object' && participant !== null && !!participant.musicianId;
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {participants.map((participant, index) => {
          const clickable = isClickable(participant);
          const name = getParticipantName(participant);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.02, 1.0) }}
              onClick={() => handleParticipantClick(participant)}
              className={`
                flex items-center justify-center text-center
                h-14 px-2 rounded-xl border transition-all duration-200 overflow-hidden
                ${clickable
                  ? 'bg-white border-jeju-ocean/20 cursor-pointer hover:bg-jeju-ocean hover:text-white hover:border-jeju-ocean hover:shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <span className={`font-medium leading-tight line-clamp-2 ${clickable ? 'text-jeju-ocean group-hover:text-white' : 'text-gray-700'} ${name.length > 10 ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                {name}
              </span>
            </motion.div>
          );
        })}
      </div>

      {selectedMusician && (
        <MusicianModal
          musician={selectedMusician}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default CampLineup;
