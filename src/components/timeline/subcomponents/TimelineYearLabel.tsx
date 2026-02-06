import React from 'react';
import { useTranslation } from 'next-i18next';
import { TimelineEvent } from '../../../data/timeline';

interface TimelineYearLabelProps {
    event: TimelineEvent;
    align: 'left' | 'right';
}

const TimelineYearLabel: React.FC<TimelineYearLabelProps> = ({ event, align }) => {
    const { t } = useTranslation();

    return (
        <div className={`flex flex-col justify-center h-full ${align === 'right' ? 'items-end' : 'items-start'}`}>
            <span className="text-3xl font-bold text-jeju-ocean/80 font-display">{event.year}</span>
            {event.month && (
                <span className="text-ocean-mist font-medium">{t(`timeline.month_${event.month}`)}</span>
            )}
        </div>
    );
};

export default TimelineYearLabel;
