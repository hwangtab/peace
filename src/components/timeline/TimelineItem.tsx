import React from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '../../data/timeline';

import TimelineCardContent from './subcomponents/TimelineCardContent';
import TimelineMobileCard from './subcomponents/TimelineMobileCard';
import TimelineYearLabel from './subcomponents/TimelineYearLabel';

interface TimelineItemProps {
    event: TimelineEvent;
    isLeft: boolean;
}

// Move static objects outside component to prevent recreation
const eventTypeColor = {
    camp: 'bg-jeju-ocean',
    album: 'bg-golden-sun',
    milestone: 'bg-sunset-coral'
};

const eventTypeBorder = {
    camp: 'border-jeju-ocean',
    album: 'border-golden-sun',
    milestone: 'border-sunset-coral'
};

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 }
    }
};

const mobileContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, delay: 0.2 }
    }
};

// Memoized component to prevent unnecessary re-renders
const TimelineItem = React.memo<TimelineItemProps>(({ event, isLeft }) => {
    // Content variants depend on isLeft, so keep them inside
    const contentVariants = {
        hidden: { opacity: 0, x: isLeft ? -20 : 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, delay: 0.2 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-stretch mb-8 md:mb-16 w-full"
        >
            {/* Left Column (5/12) - Hidden on mobile */}
            <div className="hidden md:flex md:w-5/12 md:pr-8 md:justify-end">
                {isLeft ? (
                    <motion.div variants={contentVariants} className="w-full text-right">
                        <TimelineCardContent event={event} eventTypeColor={eventTypeColor} />
                    </motion.div>
                ) : (
                    <div className="w-full">
                        <TimelineYearLabel event={event} align="right" />
                    </div>
                )}
            </div>

            {/* Center Column (2/12 on desktop, hidden on mobile) */}
            <div className="hidden md:flex md:w-2/12 md:justify-center relative">
                <div className="w-1 bg-transparent h-full absolute left-1/2 -translate-x-1/2" /> {/* Spacer for line */}
                <motion.div
                    whileInView={{ scale: 1.2 }}
                    transition={{ duration: 0.4 }}
                    className={`w-6 h-6 rounded-full bg-cloud-white border-4 ${eventTypeBorder[event.eventType]} shadow-md z-10 mt-6`}
                />
            </div>

            {/* Right Column (5/12 on desktop, full width on mobile) */}
            <div className="w-full md:w-5/12 md:pl-8 flex justify-start">
                {/* Mobile view: Always show full card with year inside */}
                <div className="block md:hidden w-full">
                    <TimelineMobileCard
                        event={event}
                        eventTypeColor={eventTypeColor}
                        mobileContentVariants={mobileContentVariants}
                    />
                </div>

                {/* Desktop view: Show conditional layout (left/right content) */}
                <div className="hidden md:block w-full">
                    {!isLeft ? (
                        <motion.div variants={contentVariants} className="w-full text-left">
                            <TimelineCardContent event={event} eventTypeColor={eventTypeColor} />
                        </motion.div>
                    ) : (
                        <div className="w-full">
                            <TimelineYearLabel event={event} align="left" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

TimelineItem.displayName = 'TimelineItem';

export default TimelineItem;
