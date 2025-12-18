import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Participant } from '../../types/camp';
import { musicians } from '../../data/musicians';
import MusicianModal from '../musicians/MusicianModal';
import { Musician } from '../../types/musician';

interface CampParticipantsProps {
    participants: (string | Participant)[];
    inView: boolean;
}

const CampParticipants: React.FC<CampParticipantsProps> = ({ participants, inView }) => {
    const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleParticipantClick = (participant: string | Participant) => {
        if (typeof participant === 'object' && participant.musicianId) {
            const musician = musicians.find(m => m.id === participant.musicianId);
            if (musician) {
                setSelectedMusician(musician);
                setIsModalOpen(true);
            }
        }
    };

    const getParticipantName = (participant: string | Participant) => {
        return typeof participant === 'string' ? participant : participant.name;
    };

    const isClickable = (participant: string | Participant) => {
        return typeof participant === 'object' && !!participant.musicianId;
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {participants.map((participant, index) => {
                    const clickable = isClickable(participant);
                    const name = getParticipantName(participant);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                            className={`flex items-center gap-2 ${clickable ? 'cursor-pointer group' : ''}`}
                            onClick={() => handleParticipantClick(participant)}
                        >
                            <span className={`inline-block w-2 h-2 rounded-full transition-colors duration-200 mt-1.5 ${clickable ? 'bg-jeju-ocean group-hover:bg-ocean-mist' : 'bg-jeju-ocean'}`} />
                            <h3 className={`typo-h3 !text-lg transition-colors duration-200 ${clickable ? 'text-jeju-ocean group-hover:text-ocean-mist underline underline-offset-4 decoration-jeju-ocean/30' : 'text-coastal-gray'}`}>
                                {name}
                            </h3>
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

export default CampParticipants;
