import React, { useMemo } from 'react';
import { m as motion } from 'framer-motion';
import { Participant } from '@/types/camp';
import MusicianCard from '../musicians/MusicianCard';
import { Musician } from '@/types/musician';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface CampLineupProps {
  participants: (string | Participant)[];
  musicians: Musician[];
  campYear?: number;
}

const CampLineup: React.FC<CampLineupProps> = ({ participants, musicians, campYear }) => {
  // 참가자 수십 명 × musicians.find() 가 렌더마다 O(n²) 였다 → id→Musician Map 으로 O(n).
  const musicianById = useMemo(() => new Map(musicians.map((m) => [m.id, m])), [musicians]);
  const { viewport, itemTransition } = useScrollReveal();

  const getParticipantName = (participant: string | Participant) => {
    if (!participant) return '';
    return typeof participant === 'string' ? participant : participant.name;
  };

  const findMusician = (participant: string | Participant): Musician | null => {
    if (typeof participant === 'object' && participant !== null && participant.musicianId) {
      return musicianById.get(participant.musicianId) || null;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {participants.map((participant, index) => {
        const musician = findMusician(participant);

        if (musician) {
          return (
            <MusicianCard
              key={musician.id}
              musician={musician}
              href={campYear ? `/camps/${campYear}/musicians/${musician.id}` : undefined}
            />
          );
        }

        const name = getParticipantName(participant);
        return (
          <motion.div
            key={`${name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={itemTransition()}
            className="flex items-center justify-center text-center h-full min-h-[120px] sm:min-h-[200px] px-4 rounded-2xl border bg-white border-seafoam/40 shadow-lg"
          >
            <span className="font-medium text-coastal-gray text-lg break-words">{name}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CampLineup;
