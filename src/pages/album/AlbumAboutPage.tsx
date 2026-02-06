import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import Button from '../../components/common/Button';
import PageLayout from '../../components/layout/PageLayout';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/common/SectionHeader';
import { getVideos } from '../../api/videos';
import { getMusicians } from '../../api/musicians';
import MusicianModal from '../../components/musicians/MusicianModal';
import ImageLightbox from '../../components/common/ImageLightbox';
import AlbumTabContent from '../../components/album/AlbumTabContent';
import { getGalleryImages } from '../../api/gallery';
import { GalleryImage } from '../../types/gallery';
import { VideoItem } from '../../types/video';
import { Musician } from '../../types/musician';
import WaveDivider from '../../components/common/WaveDivider';
import { getMusicAlbumSchema } from '../../utils/structuredData';
import { getFullUrl } from '../../config/env';

interface AlbumAboutPageProps {
  initialVideos?: VideoItem[];
  initialMusicians?: Musician[];
  initialImages?: GalleryImage[];
}

const AlbumAboutPage = ({
  initialVideos = [],
  initialMusicians = [],
  initialImages = []
}: AlbumAboutPageProps) => {
  const { t, i18n } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [musicians, setMusicians] = useState<Musician[]>(initialMusicians);

  // Load images (language-independent) if not provided
  useEffect(() => {
    if (initialImages.length === 0) {
      getGalleryImages().then(setImages);
    }
  }, [initialImages]);

  // Load videos and musicians (language-dependent) if not provided or language changed
  useEffect(() => {
    // Only fetch if initial data is missing OR if initial data language doesn't match current language
    // But since getStaticProps handles language, we only need to refetch if language changes after mount
    const loadData = async () => {
      const [allVideos, allMusicians] = await Promise.all([
        getVideos(i18n.language),
        getMusicians(i18n.language),
      ]);
      setVideos(allVideos);
      setMusicians(allMusicians);
    };

    if (initialVideos.length === 0 || initialMusicians.length === 0) {
      loadData();
    }
  }, [i18n.language, initialVideos.length, initialMusicians.length]); // Keep language dependency to refetch on lang switch

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
                  loading="eager"
                  quality={90}
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

          <AlbumTabContent
            concerts={concerts}
            albumVideos={albumVideos}
            albumPhotos={albumPhotos}
            onMusicianClick={handleMusicianClick}
            onImageClick={setSelectedImage}
          />

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
