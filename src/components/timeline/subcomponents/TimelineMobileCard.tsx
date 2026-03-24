import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { TimelineEvent } from '@/data/timeline';

interface TimelineMobileCardProps {
    event: TimelineEvent;
    eventTypeColor: Record<string, string>;
    mobileContentVariants: Variants;
}

const TimelineMobileCard: React.FC<TimelineMobileCardProps> = ({
    event,
    eventTypeColor,
    mobileContentVariants
}) => {
    const { t } = useTranslation();

    return (
        <motion.div
            variants={mobileContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="bg-cloud-white rounded-xl p-4 shadow-sm border border-ocean-mist/20 w-full"
        >
            {/* 연도 레이블 - 모바일에서 카드 안에 */}
            <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-jeju-ocean/80 font-display">
                    {event.year}
                </span>
                {event.month && (
                    <span className="text-sm text-ocean-mist font-medium">
                        {t(`timeline.month_${event.month}`)}
                    </span>
                )}
            </div>

            {/* 이벤트 타입 뱃지 */}
            <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold ${eventTypeColor[event.eventType]} mb-3 shadow-sm`}>
                {t(`timeline.labels.${event.eventType}`)}
            </span>

            {/* 제목 */}
            <h3 className="text-lg font-bold text-jeju-ocean mb-2 font-display text-balance break-words">
                {t(event.titleKey)}
            </h3>

            {/* 설명 */}
            <p className="text-sm text-coastal-gray mb-3 leading-relaxed text-pretty break-words">
                {t(event.descriptionKey)}
            </p>

            {/* 위치 */}
            {event.locationKey && (
                <p className="text-xs text-ocean-mist flex items-center font-medium">
                    <span className="mr-1" aria-hidden="true">📍</span> {t(event.locationKey)}
                </p>
            )}
        </motion.div>
    );
};

export default TimelineMobileCard;
