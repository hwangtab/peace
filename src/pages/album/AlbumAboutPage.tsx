import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import PageLayout from '../../components/layout/PageLayout';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/common/SectionHeader';
import { getVideos } from '../../api/videos';
import { getMusicians } from '../../api/musicians';
import MusicianModal from '../../components/musicians/MusicianModal';
import VideoCard from '../../components/videos/VideoCard';
import ImageLightbox from '../../components/common/ImageLightbox';
import { getGalleryImages } from '../../api/gallery';
import { GalleryImage } from '../../types/gallery';
import { VideoItem } from '../../types/video';
import { Musician } from '../../types/musician';
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import WaveDivider from '../../components/common/WaveDivider';
import { getMusicAlbumSchema } from '../../utils/structuredData';
import { getFullUrl } from '../../config/env';

const AlbumAboutPage = () => {
  const { t, i18n } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'video' | 'photo'>('info');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [musicians, setMusicians] = useState<Musician[]>([]);

  // Load photos and videos dynamically
  useEffect(() => {
    const loadData = async () => {
      const [allImages, allVideos, allMusicians] = await Promise.all([
        getGalleryImages(),
        getVideos(i18n.language),
        getMusicians(i18n.language),
      ]);
      setImages(allImages);
      setVideos(allVideos);
      setMusicians(allMusicians);
    };
    loadData();
  }, [i18n.language]);

  const handleMusicianClick = useCallback((musicianId: number | null) => {
    if (musicianId) {
      const musician = musicians.find((m) => m.id === musicianId);
      if (musician) {
        setSelectedMusician(musician);
        setIsModalOpen(true);
      }
    }
  }, [musicians]);

  const fadeUpVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }),
    []
  );

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
      },
    }),
    []
  );

  const resolveMusicianName = useCallback((fallbackName: string, musicianId?: number | null) => {
    if (!musicianId) return fallbackName;
    return musicians.find((m) => m.id === musicianId)?.name || fallbackName;
  }, [musicians]);

  const fallbackName = useCallback((ko: string, en: string) => (
    i18n.language.startsWith('ko') ? ko : en
  ), [i18n.language]);

  // Concert data with musician IDs for linking
  const concerts = useMemo(() => ([
    {
      id: 'gangjeong',
      name: t('album.concert_gangjeong'),
      date: t('album.concert_gangjeong_date'),
      time: t('album.concert_time'),
      venue: t('album.venue_gangjeong'),
      performers: [
        { name: resolveMusicianName('Project Around Surround', 1), musicianId: 1 },
        { name: resolveMusicianName(fallbackName('정진석', 'Jeong Jinseok'), 2), musicianId: 2 },
        { name: resolveMusicianName(fallbackName('남수', 'Namsu'), 4), musicianId: 4 },
        { name: resolveMusicianName(fallbackName('모레도토요일', 'MoredoSaturday'), 7), musicianId: 7 },
        { name: resolveMusicianName('Jai x HANASH', 11), musicianId: 11 },
      ],
    },
    {
      id: 'hongdae',
      name: t('album.concert_hongdae'),
      date: t('album.concert_hongdae_date'),
      time: t('album.concert_time'),
      venue: t('album.venue_hongdae'),
      performers: [
        { name: resolveMusicianName(fallbackName('김인', 'Kim In'), 6), musicianId: 6 },
        { name: resolveMusicianName(fallbackName('모모', 'MOMO'), 10), musicianId: 10 },
        { name: resolveMusicianName(fallbackName('남수', 'Namsu'), 4), musicianId: 4 },
        { name: resolveMusicianName('Jai x HANASH', 11), musicianId: 11 },
        { name: t('album.performer_gilganeun_band'), musicianId: null },
        { name: resolveMusicianName(fallbackName('김동산과 블루이웃', 'Kim Dongsan & Blueeewoot'), 3), musicianId: 3 },
      ],
    },
  ]), [fallbackName, resolveMusicianName, t]);

  // Filter album photos and videos
  const albumPhotos = useMemo(
    () => images.filter((img) => img.eventType === 'album' && img.eventYear === 2024),
    [images]
  );
  const albumVideos = useMemo(
    () => videos.filter((video) => video.eventType === 'album' && video.eventYear === 2024),
    [videos]
  );

  // MusicAlbum Schema
  const albumSchema = useMemo(() => getMusicAlbumSchema({
    name: t('album.album_title_full'),
    byArtist: { name: t('app.title') },
    genre: ["Folk", "Rock", "Jazz", "Electronic", "Ambient", "World Music"],
    image: getFullUrl("/images-webp/album/albumart.png"),
    datePublished: "2024-10-12",
    numTracks: 12,
    track: musicians.filter(m => m.trackTitle && m.id && m.id <= 13 && m.id !== 13).map(m => ({ // Include all except performance team if needed, but list implies 12 tracks
      // Actually there are 13 musicians in the list. ID 13 is performance.
      // Logic: checking if trackTitle exists.
      name: m.trackTitle || "",
      url: "https://peaceandmusic.net/album/tracks"
    }))
  }), [musicians, t]);

  return (
    <PageLayout
      title={t('album.page_title')}
      description={t('album.page_desc')}
      keywords={t('album.keywords')}
      background="jeju-ocean"
      structuredData={albumSchema}
      disableTopPadding={true}
      className="!pb-0"
    >
      {/* Hero Section embedded in PageLayout content, or separate? 
          Original had a hero section with background decorations. 
          I'll keep the structure but wrap everything in PageLayout. 
          The PageLayout adds padding, so I might need to adjust.
          Actually, PageLayout standardizes padding. I'll rely on it.
      */}

      <div className="relative overflow-hidden">
        {/* Background Decorative Elements - reimplemented inside container or just kept here */}
        <div className="absolute top-[-20%] right-[-10%] w-2/3 h-[120%] bg-ocean-mist/20 rounded-full blur-3xl z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-2/3 bg-golden-sun/10 rounded-full blur-3xl z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jeju-ocean/5 rounded-full blur-3xl z-0" />

        <div className="container mx-auto px-4 relative z-10 pt-32 pb-12">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
          >
            {/* Left: Album Art */}
            <motion.div variants={fadeUpVariants} className="w-full lg:w-5/12 max-w-lg">
              <div className="relative aspect-square rounded-xl shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                <Image
                  src="/images-webp/album/albumart.png"
                  alt={t('album.image_alt_cover')}
                  fill
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none" />
              </div>
            </motion.div>

            {/* Right: Info */}
            <motion.div
              variants={fadeUpVariants}
              className="w-full lg:w-7/12 text-center lg:text-left"
            >
              <span className="inline-block px-3 py-1 bg-jeju-ocean text-white text-sm font-bold tracking-wider rounded-full mb-6">
                {t('album.release_official')}
              </span>
              <h1 className="typo-h1 text-white mb-6 leading-tight">
                {t('album.hero_title_1')}
                <br />{t('album.hero_title_2')}
              </h1>
              <p className="typo-subtitle text-white/90 font-medium mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('album.hero_subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button to="/album/tracks" variant="gold">
                  {t('album.listen_tracks')}
                </Button>
                <Button to="/album/musicians" variant="white-outline">
                  {t('album.intro_musicians')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Section background="white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Card 1: Meaning */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-ocean-sand/30 p-10 rounded-3xl"
            >
              <h3 className="typo-h3 text-jeju-ocean mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-golden-sun flex items-center justify-center text-white text-sm">
                  01
                </span>
                {t('album.meaning_title')}
              </h3>
              <p className="typo-body text-gray-700 leading-loose">
                {t('album.meaning_desc')}
              </p>
            </motion.div>

            {/* Card 2: Participants */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-ocean-sand/30 p-10 rounded-3xl"
            >
              <h3 className="typo-h3 text-jeju-ocean mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-jeju-ocean flex items-center justify-center text-white text-sm">
                  02
                </span>
                {t('album.voices_title')}
              </h3>
              <p className="typo-body text-gray-700 leading-loose">
                {t('album.voices_desc')}
              </p>
            </motion.div>
          </div>
        </div>
      </Section>

      <WaveDivider className="text-ocean-sand -mt-[60px] sm:-mt-[100px] relative z-10" />

      {/* Release Commemoration Concerts - Integrated Tab Section */}
      <Section background="ocean-sand" className="!pb-0">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('album.concert_title')}
            subtitle={t('album.concert_subtitle')}
            className="!mb-8"
          />

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner border border-white/50">
              {[
                { id: 'info', label: t('album.tab_info') },
                { id: 'video', label: t('album.tab_video') },
                { id: 'photo', label: t('album.tab_photo') },
              ].map((tab) => (
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
                {/* Concert Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
                  {concerts.map((concert, index) => (
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
                        <h3 className="typo-h3 text-2xl mb-8 group-hover:text-jeju-ocean transition-colors duration-300">
                          {concert.name}
                        </h3>

                        <div className="space-y-4 mb-8">
                          <div className="flex items-center gap-4 text-gray-700">
                            <div className="w-10 h-10 rounded-full bg-ocean-sand flex items-center justify-center text-jeju-ocean">
                              <CalendarIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">
                                {t('album.label_date')}
                              </span>
                              <span className="font-medium">
                                {concert.date}{' '}
                                <span className="text-coastal-gray text-sm">{concert.time}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-gray-700">
                            <div className="w-10 h-10 rounded-full bg-ocean-sand flex items-center justify-center text-jeju-ocean">
                              <MapPinIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">
                                {t('album.label_venue')}
                              </span>
                              <span className="font-medium">{concert.venue}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-center gap-2 mb-4">
                            <UserGroupIcon className="w-4 h-4 text-jeju-ocean" />
                            <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">
                              {t('album.label_performers')}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {concert.performers.map((performer, idx) =>
                              performer.musicianId ? (
                                <button
                                  key={idx}
                                  onClick={() => handleMusicianClick(performer.musicianId)}
                                  className="px-3 py-1.5 bg-ocean-sand text-jeju-ocean rounded-lg text-xs font-medium border border-jeju-ocean/10 hover:border-jeju-ocean hover:bg-jeju-ocean hover:text-white hover:shadow-md transition-all duration-300"
                                >
                                  {performer.name}
                                </button>
                              ) : (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 bg-ocean-mist/5 text-ocean-mist/80 rounded-lg text-xs font-medium border border-ocean-mist/10"
                                >
                                  {performer.name}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
                      onClick={() => setSelectedImage(photo)}
                    >
                      <Image
                        src={photo.url}
                        alt={t('album.image_alt_concert', { num: index + 1 })}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
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

          {/* Credits Area - Now integrated for cleaner layout with proper spacing */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 md:mt-24 pt-16 md:pt-20 pb-20 border-t border-jeju-ocean/10 text-center"
          >
            <p className="text-coastal-gray font-serif text-lg">
              {t('common.label_produced_by')} <span className="text-jeju-ocean font-bold">{t('app.title')}</span> ·
              2024
            </p>
          </motion.div>
        </div>
      </Section>
      {/* Modal */}
      {selectedMusician && (
        <MusicianModal
          musician={selectedMusician}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {selectedImage && (
        <ImageLightbox
          image={{
            url: selectedImage.url,
            alt: t('album.image_alt_concert', { num: selectedImage.id }),
          }}
          onClose={() => setSelectedImage(null)}
          maxHeight="85vh"
        />
      )}
    </PageLayout>
  );
};

export default AlbumAboutPage;
