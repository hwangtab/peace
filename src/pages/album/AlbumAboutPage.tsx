import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import Button from '@/components/common/Button';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import { getVideos } from '@/api/videos';
import { getMusicians } from '@/api/musicians';
import MusicianModal from '@/components/musicians/MusicianModal';
import dynamic from 'next/dynamic';
const ImageLightbox = dynamic(() => import('@/components/common/ImageLightbox'), { ssr: false });
import AlbumTabContent from '@/components/album/AlbumTabContent';
import { getGalleryImages } from '@/api/gallery';
import { GalleryImage } from '@/types/gallery';
import { VideoItem } from '@/types/video';
import { Musician } from '@/types/musician';
import WaveDivider from '@/components/common/WaveDivider';
import { getMusicAlbumSchema, getMusicGroupSchema, getBreadcrumbSchema, getWebPageSchema } from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface AlbumAboutPageProps {
  initialVideos?: VideoItem[];
  initialMusicians?: Musician[];
  initialImages?: GalleryImage[];
  initialAlbumMusicianIds?: number[];
  initialMusicianTrackIds?: Record<number, number>;
  initialLocale?: string;
}

const AlbumAboutPage = ({
  initialVideos = [],
  initialMusicians = [],
  initialImages = [],
  initialAlbumMusicianIds = [],
  initialMusicianTrackIds = {},
  initialLocale = 'ko',
}: AlbumAboutPageProps) => {
  const { t, i18n } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const fetchVideos = useCallback((locale: string) => getVideos(locale), []);
  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);

  const videosResource = useLocalizedResource<VideoItem>({
    initialData: initialVideos,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchVideos,
  });

  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });

  const videos = videosResource.data;
  const musicians = musiciansResource.data;
  const isLocaleDataLoading = videosResource.isLoading || musiciansResource.isLoading;
  const localeDataError = videosResource.error ?? musiciansResource.error;
  const shouldHideLocaleData = isLocaleDataLoading || Boolean(localeDataError);
  const visibleVideos = useMemo(
    () => (shouldHideLocaleData ? [] : videos),
    [shouldHideLocaleData, videos]
  );
  const visibleMusicians = useMemo(
    () => (shouldHideLocaleData ? [] : musicians),
    [shouldHideLocaleData, musicians]
  );
  const albumMusicianIds = useMemo(
    () => new Set(initialAlbumMusicianIds),
    [initialAlbumMusicianIds]
  );

  // Load images (language-independent) if not provided
  useEffect(() => {
    if (initialImages.length === 0) {
      let isCancelled = false;
      getGalleryImages().then((data) => {
        if (!isCancelled) setImages(data);
      });
      return () => {
        isCancelled = true;
      };
    }
  }, [initialImages]);

  const handleMusicianClick = useCallback(
    (musicianId: number | null) => {
      if (musicianId) {
        const musician = visibleMusicians.find((m) => m.id === musicianId);
        if (musician) {
          setSelectedMusician(musician);
          setIsModalOpen(true);
        }
      }
    },
    [visibleMusicians]
  );

  const fadeUpVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }),
    []
  );

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
      },
    }),
    []
  );

  const resolveMusicianName = useCallback(
    (fallbackName: string, musicianId?: number | null) => {
      if (!musicianId) return fallbackName;
      return visibleMusicians.find((m) => m.id === musicianId)?.name || fallbackName;
    },
    [visibleMusicians]
  );

  const fallbackName = useCallback(
    (ko: string, en: string) => (i18n.language.startsWith('ko') ? ko : en),
    [i18n.language]
  );

  // Concert data with musician IDs for linking
  const concerts = useMemo(
    () => [
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
          {
            name: resolveMusicianName(fallbackName('모레도토요일', 'MoredoSaturday'), 7),
            musicianId: 7,
          },
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
          {
            name: resolveMusicianName(
              fallbackName('김동산과 블루이웃', 'Kim Dongsan & Blueeewoot'),
              3
            ),
            musicianId: 3,
          },
        ],
      },
    ],
    [fallbackName, resolveMusicianName, t]
  );

  // Filter album photos and videos
  const albumPhotos = useMemo(
    () => images.filter((img) => img.eventType === 'album' && img.eventYear === 2024),
    [images]
  );
  const albumVideos = useMemo(
    () => visibleVideos.filter((video) => video.eventType === 'album' && video.eventYear === 2024),
    [visibleVideos]
  );

  // MusicAlbum Schema
  const albumSchema = useMemo(
    () =>
      getMusicAlbumSchema({
        name: t('album.album_title_full'),
        byArtist: { name: t('app.title') },
        genre: ['Folk', 'Rock', 'Jazz', 'Electronic', 'Ambient', 'World Music'],
        image: getFullUrl('/images-webp/album/albumart.webp'),
        datePublished: '2024-10-12',
        numTracks: albumMusicianIds.size,
        track: visibleMusicians
          .filter((m) => m.trackTitle && albumMusicianIds.has(m.id))
          .map((m) => ({
            name: m.trackTitle || '',
            url: getFullUrl(`/album/tracks/${initialMusicianTrackIds[m.id] ?? m.id}`),
          })),
      }),
    [albumMusicianIds, t, visibleMusicians, initialMusicianTrackIds]
  );

  const breadcrumbs = [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: t('nav.album'), url: getFullUrl('/album/about') },
  ];

  return (
    <PageLayout
      title={t('album.page_title')}
      description={t('album.page_desc')}
      ogImage="/images-webp/album/albumart.webp"
      ogImageAlt={t('album.page_title')}
      ogType="music.album"
      background="jeju-ocean"
      structuredData={[
        albumSchema,
        getMusicGroupSchema(i18n.language, t),
        getBreadcrumbSchema(breadcrumbs),
        getWebPageSchema({
          name: t('album.page_title'),
          description: t('album.page_desc'),
          url: getFullUrl('/album/about'),
          datePublished: '2024-10-12',
          keywords: [
            '이름을 모르는 먼 곳의 그대에게',
            'To You in a Distant Place Whose Name I Do Not Know',
            '평화음악 앨범',
            'peace music album',
            '강정피스앤뮤직캠프 앨범',
            'GPMC album',
            '한국 인디 컴필레이션',
            'Korean indie compilation',
          ],
        }),
      ]}
      breadcrumbs={breadcrumbs}
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
        {isLocaleDataLoading && (
          <div className="container mx-auto px-4 pt-28">
            <p className="text-center text-white/90" role="status">
              {t('common.loading')}
            </p>
          </div>
        )}
        {localeDataError && (
          <div className="container mx-auto px-4 pt-28">
            <p className="text-center text-white/90" role="alert">
              {t('common.no_results')}
            </p>
          </div>
        )}
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
                  src="/images-webp/album/albumart.webp"
                  alt={t('album.image_alt_cover')}
                  fill
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                  priority
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
                <br />
                {t('album.hero_title_2')}
              </h1>
              <p className="typo-subtitle text-white/90 font-medium mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 break-words">
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

      <Section background="white" className="pb-24 md:pb-32">
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
              <h2 className="typo-h3 text-jeju-ocean mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-golden-sun flex items-center justify-center text-white text-sm">
                  01
                </span>
                {t('album.meaning_title')}
              </h2>
              <p className="typo-body text-gray-700 leading-loose break-words">
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
              <h2 className="typo-h3 text-jeju-ocean mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-jeju-ocean flex items-center justify-center text-white text-sm">
                  02
                </span>
                {t('album.voices_title')}
              </h2>
              <p className="typo-body text-gray-700 leading-loose break-words">
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
            <p className="text-coastal-gray font-serif font-bold text-lg break-words">
              {t('common.label_produced_by')}{' '}
              <span className="text-jeju-ocean font-bold">{t('app.title')}</span> · 2024
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
      <ImageLightbox
        image={
          selectedImage
            ? {
                url: selectedImage.url,
                alt: t('album.image_alt_concert', { num: selectedImage.id }),
              }
            : null
        }
        show={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxHeight="85vh"
      />
    </PageLayout>
  );
};

export default AlbumAboutPage;
