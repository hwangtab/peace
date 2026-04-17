import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Participant } from '@/types/camp';
import MusicianModal from '../musicians/MusicianModal';
import { Musician } from '@/types/musician';

interface CampParticipantsProps {
    participants: (string | Participant)[];
    musicians: Musician[];
}

const CampParticipants: React.FC<CampParticipantsProps> = ({ participants, musicians }) => {
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {participants.map((participant, index) => {
                    const clickable = isClickable(participant);
                    const name = getParticipantName(participant);
                    const stableKey = typeof participant === 'object' && participant !== null
                        ? (participant.musicianId ?? participant.name)
                        : participant;

                    const musician = clickable
                        ? musicians.find(m => typeof participant === 'object' && m.id === participant.musicianId)
                        : undefined;
                    const albumHref = musician?.trackId !== undefined
                        ? `/album/musicians/${musician.id}`
                        : undefined;

                    return (
                        <motion.div
                            key={stableKey}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className={`flex items-start gap-2 min-w-0 ${clickable ? 'cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded' : ''}`}
                            role={clickable ? "button" : undefined}
                            aria-label={clickable ? name : undefined}
                            tabIndex={clickable ? 0 : undefined}
                            onClick={() => handleParticipantClick(participant)}
                            onKeyDown={clickable ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleParticipantClick(participant); } } : undefined}
                        >
                            <span className={`inline-block w-2 h-2 rounded-full transition-colors duration-200 mt-1.5 ${clickable ? 'bg-jeju-ocean group-hover:bg-ocean-mist' : 'bg-jeju-ocean'}`} />
                            <h3 className={`typo-h3 !text-lg transition-colors duration-200 ${clickable ? 'text-jeju-ocean group-hover:text-ocean-mist underline underline-offset-4 decoration-jeju-ocean/30' : 'text-coastal-gray'}`}>
                                {albumHref ? (
                                    <Link href={albumHref} onClick={(e) => e.preventDefault()}>
                                        {name}
                                    </Link>
                                ) : name}
                            </h3>
                        </motion.div>
                    );
                })}
            </div>

            {selectedMusician && (
                <MusicianModal
                    musician={selectedMusician}
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedMusician(null); }}
                />
            )}
        </>
    );
};

export default CampParticipants;
