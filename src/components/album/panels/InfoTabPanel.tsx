import React from 'react';
import ConcertCard, { Concert } from '../ConcertCard';

interface InfoTabPanelProps {
    concerts: Concert[];
    onMusicianClick: (musicianId: number | null) => void;
}

const InfoTabPanel: React.FC<InfoTabPanelProps> = ({ concerts, onMusicianClick }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
        {concerts.map((concert, index) => (
            <ConcertCard
                key={concert.id}
                concert={concert}
                onMusicianClick={onMusicianClick}
                index={index}
            />
        ))}
    </div>
);

export default InfoTabPanel;
