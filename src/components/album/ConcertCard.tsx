import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUserGroup } from 'react-icons/hi';
import Button from '@/components/common/Button';

interface Performer {
    name: string;
    musicianId: number | null;
}

interface Concert {
    id: string;
    name: string;
    date: string;
    time: string;
    venue: string;
    performers: Performer[];
}

interface ConcertCardProps {
    concert: Concert;
    onMusicianClick: (musicianId: number | null) => void;
    index: number;
}

const ConcertCard: React.FC<ConcertCardProps> = ({ concert, onMusicianClick, index }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            key={concert.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
        >
            {/* Card Header Background Decor */}
            <div className="h-2 bg-gradient-to-r from-jeju-ocean to-ocean-mist opacity-80" />

            <div className="p-8 flex-1 flex flex-col">
                <h3 className="typo-h3 text-2xl mb-8 group-hover:text-jeju-ocean transition-colors duration-300 break-words">
                    {concert.name}
                </h3>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-ocean-sand flex items-center justify-center text-jeju-ocean">
                            <HiOutlineCalendar className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">
                                {t('album.label_date')}
                            </span>
                            <span className="font-medium break-words">
                                {concert.date}{' '}
                                <span className="text-coastal-gray text-sm">{concert.time}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-ocean-sand flex items-center justify-center text-jeju-ocean">
                            <HiOutlineLocationMarker className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">
                                {t('album.label_venue')}
                            </span>
                            <span className="font-medium break-words">{concert.venue}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <HiOutlineUserGroup className="w-4 h-4 text-jeju-ocean" />
                        <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">
                            {t('album.label_performers')}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {concert.performers.map((performer, idx) =>
                            performer.musicianId ? (
                                <Button
                                    key={`${performer.name}-${idx}`}
                                    onClick={() => onMusicianClick(performer.musicianId)}
                                    variant="back"
                                    size="sm"
                                    shape="rounded"
                                    className="!px-3 !py-1.5 !text-xs"
                                >
                                    {performer.name}
                                </Button>
                            ) : (
                                <span
                                    key={`${performer.name}-${idx}`}
                                    className="px-3 py-1.5 bg-ocean-mist/5 text-ocean-mist/80 rounded-lg text-xs font-medium border border-ocean-mist/10 break-words"
                                >
                                    {performer.name}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ConcertCard;
