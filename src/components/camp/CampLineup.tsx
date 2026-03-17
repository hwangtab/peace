import React from 'react';
import { motion } from 'framer-motion';
import { Participant } from '../../types/camp';
import MusicianCard from '../musicians/MusicianCard';
import { Musician } from '../../types/musician';

interface CampLineupProps {
  participants: (string | Participant)[];
  musicians: Musician[];
  inView: boolean;
  campYear?: number;
}

const CampLineup: React.FC<CampLineupProps> = ({ participants, musicians, inView, campYear }) => {
  const getParticipantName = (participant: string | Participant) => {
    if (!participant) return '';
    return typeof participant === 'string' ? participant : participant.name;
  };

  const findMusician = (participant: string | Participant): Musician | null => {
    if (typeof participant === 'object' && participant !== null && participant.musicianId) {
      return musicians.find(m => m.id === participant.musicianId) || null;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {participants.map((participant, index) => {
        const musician = findMusician(participant);

        if (musician) {
          return (
            <MusicianCard
              key={musician.id}
              musician={musician}
              index={index}
              href={campYear ? `/camps/${campYear}/musicians/${musician.id}` : undefined}
            />
          );
        }

        const name = getParticipantName(participant);
        return (
          <motion.div
            key={`plain-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.02, 1.0) }}
            className="flex items-center justify-center text-center h-full min-h-[200px] px-4 rounded-lg border bg-white border-gray-200 shadow-lg"
          >
            <span className="font-medium text-gray-700 text-lg">
              {name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CampLineup;
