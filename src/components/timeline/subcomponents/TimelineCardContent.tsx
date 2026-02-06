import React from 'react';
import { useTranslation } from 'next-i18next';
import { TimelineEvent } from '../../../data/timeline';

interface TimelineCardContentProps {
    event: TimelineEvent;
    eventTypeColor: Record<string, string>;
}

const TimelineCardContent: React.FC<TimelineCardContentProps> = ({ event, eventTypeColor }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-cloud-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-ocean-mist/20">
            <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold ${eventTypeColor[event.eventType]} mb-3 shadow-sm`}>
                {t(`timeline.labels.${event.eventType}`)}
            </span>
            <h3 className="typo-h3 text-jeju-ocean mb-2 text-balance break-words">{t(event.titleKey)}</h3>
            <p className="typo-body text-coastal-gray mb-3 text-sm text-pretty break-words">{t(event.descriptionKey)}</p>
            {event.locationKey && (
                <p className="text-xs text-ocean-mist flex items-center font-medium">
                    <span className="mr-1">📍</span> {t(event.locationKey)}
                </p>
            )}
        </div>
    );
};

export default TimelineCardContent;
