import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { GalleryImage } from '@/types/gallery';
import { VideoItem } from '@/types/video';
import { Concert } from './ConcertCard';
import InfoTabPanel from './panels/InfoTabPanel';
import VideoTabPanel from './panels/VideoTabPanel';
import PhotoTabPanel from './panels/PhotoTabPanel';

interface AlbumTabContentProps {
    concerts: Concert[];
    albumVideos: VideoItem[];
    albumPhotos: GalleryImage[];
    onMusicianClick: (musicianId: number | null) => void;
    onImageClick: (image: GalleryImage) => void;
}

const tabAnimation = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4 },
};

const AlbumTabContent: React.FC<AlbumTabContentProps> = ({
    concerts,
    albumVideos,
    albumPhotos,
    onMusicianClick,
    onImageClick
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'info' | 'video' | 'photo'>('info');

    const tabs = [
        { id: 'info', label: t('album.tab_info') },
        { id: 'video', label: t('album.tab_video') },
        { id: 'photo', label: t('album.tab_photo') },
    ];

    return (
        <>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-12">
                <div role="tablist" className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner border border-white/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`${tab.id}-panel`}
                            onClick={() => setActiveTab(tab.id as 'info' | 'video' | 'photo')}
                            className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-[color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${activeTab === tab.id ? 'text-white' : 'text-coastal-gray hover:text-jeju-ocean'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 bg-jeju-ocean rounded-xl shadow-lg"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'info' && (
                    <motion.div key="info-tab" id="info-panel" role="tabpanel" {...tabAnimation}>
                        <InfoTabPanel concerts={concerts} onMusicianClick={onMusicianClick} />
                    </motion.div>
                )}

                {activeTab === 'video' && (
                    <motion.div key="video-tab" id="video-panel" role="tabpanel" {...tabAnimation}>
                        <VideoTabPanel albumVideos={albumVideos} />
                    </motion.div>
                )}

                {activeTab === 'photo' && (
                    <motion.div key="photo-tab" id="photo-panel" role="tabpanel" {...tabAnimation}>
                        <PhotoTabPanel albumPhotos={albumPhotos} onImageClick={onImageClick} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AlbumTabContent;
