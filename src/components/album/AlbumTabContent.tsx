import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Button from '../common/Button';
import VideoCard from '../videos/VideoCard';
import ConcertCard from './ConcertCard';
import { GalleryImage } from '../../types/gallery';
import { VideoItem } from '../../types/video';

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

interface AlbumTabContentProps {
    concerts: Concert[];
    albumVideos: VideoItem[];
    albumPhotos: GalleryImage[];
    onMusicianClick: (musicianId: number | null) => void;
    onImageClick: (image: GalleryImage) => void;
}

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
                <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner border border-white/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'info' | 'video' | 'photo')}
                            className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'text-white' : 'text-coastal-gray hover:text-jeju-ocean'
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
                    <motion.div
                        key="info-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
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
                    </motion.div>
                )}

                {activeTab === 'video' && (
                    <motion.div
                        key="video-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
                            {albumVideos.map((video, index) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <VideoCard video={video} />
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Button to="/videos?filter=album-2024" variant="outline">
                                {t('videos.all_videos')}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'photo' && (
                    <motion.div
                        key="photo-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
                            {albumPhotos.slice(0, 12).map((photo, index) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                                    onClick={() => onImageClick(photo)}
                                >
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={photo.url}
                                            alt={t('album.image_alt_concert', { num: index + 1 })}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            className="object-cover"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Button to="/gallery?filter=album-2024" variant="primary">
                                {t('album.all_photos')}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AlbumTabContent;
