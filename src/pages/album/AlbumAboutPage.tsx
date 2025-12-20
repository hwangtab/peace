import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import PageLayout from '../../components/layout/PageLayout';
import Section from '../../components/layout/Section';
import SectionHeader from '../../components/common/SectionHeader';
import { videoItems } from '../../data/videos';
import { musicians } from '../../data/musicians';
import MusicianModal from '../../components/musicians/MusicianModal';
import VideoCard from '../../components/videos/VideoCard';
import ImageLightbox from '../../components/common/ImageLightbox';
import { getGalleryImages } from '../../api/gallery';
import { GalleryImage } from '../../types/gallery';
import { Musician } from '../../types/musician';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const AlbumAboutPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'video' | 'photo'>('info');
  const [images, setImages] = useState<GalleryImage[]>([]);

  const handleMusicianClick = (musicianId: number | null) => {
    if (musicianId) {
      const musician = musicians.find(m => m.id === musicianId);
      if (musician) {
        setSelectedMusician(musician);
        setIsModalOpen(true);
      }
    }
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Load photos dynamically
  useEffect(() => {
    const loadData = async () => {
      const allImages = await getGalleryImages();
      setImages(allImages);
    };
    loadData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  // Concert data with musician IDs for linking
  const concerts = [
    {
      id: 'gangjeong',
      name: '강정 공연',
      date: '2024년 10월 12일(토)',
      time: '19:00~',
      venue: '강정평화센터',
      performers: [
        { name: 'Project Around Surround', musicianId: 1 },
        { name: '정진석', musicianId: 2 },
        { name: '남수', musicianId: 4 },
        { name: '모레도토요일', musicianId: 7 },
        { name: '자이(Jai) x HANASH', musicianId: 11 }
      ]
    },
    {
      id: 'hongdae',
      name: '홍대 공연',
      date: '2024년 11월 2일(토)',
      time: '19:00~',
      venue: '스페이스 한강',
      performers: [
        { name: '김인', musicianId: 6 },
        { name: '모모', musicianId: 10 },
        { name: '남수', musicianId: 4 },
        { name: '자이(Jai) x HANASH', musicianId: 11 },
        { name: '길가는 밴드 장현호', musicianId: null },
        { name: '김동산과 블루이웃', musicianId: 3 }
      ]
    }
  ];

  // Filter album photos and videos
  const albumPhotos = useMemo(() =>
    images.filter(img => img.eventType === 'album' && img.eventYear === 2024),
    [images]
  );
  const albumVideos = videoItems.filter(video => video.eventType === 'album' && video.eventYear === 2024);

  return (
    <PageLayout
      title="이름을 모르는 먼 곳의 그대에게 - 앨범 소개"
      description="강정피스앤뮤직캠프의 2024년 음반 프로젝트. 전쟁을 끝내고 평화를 노래하는 12곡의 음악 여정."
      keywords="이름을 모르는 먼 곳의 그대에게, 강정피스앤뮤직캠프, 음반, 평화음악"
      background="jeju-ocean"
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
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
          >
            {/* Left: Album Art */}
            <motion.div
              variants={fadeUpVariants}
              className="w-full lg:w-5/12 max-w-lg"
            >
              <div className="relative aspect-square rounded-xl shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                <img
                  src="/images-webp/album/albumart.png"
                  alt="이름을 모르는 먼 곳의 그대에게 앨범 커버"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
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
                2024 OFFICIAL RELEASE
              </span>
              <h1 className="typo-h1 text-white mb-6 leading-tight">
                이름을 모르는<br />먼 곳의 그대에게
              </h1>
              <p className="typo-subtitle text-white/90 font-medium mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                전쟁과 폭력이 만연한 세상에서 보내는 평화의 편지.<br className="hidden md:block" />
                12팀의 뮤지션이 강정마을에서 쏘아 올린 음악의 파동.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  to="/album/tracks"
                  variant="gold"
                >
                  수록곡 듣기
                </Button>
                <Button
                  to="/album/musicians"
                  variant="white-outline"
                >
                  참여 뮤지션 소개
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
                <span className="w-8 h-8 rounded-full bg-golden-sun flex items-center justify-center text-white text-sm">01</span>
                제목의 의미
              </h3>
              <p className="typo-body text-gray-700 leading-loose">
                "이름을 모르는 먼 곳의 그대에게"는 세계 곳곳의 분쟁 지역에서 고통받고 있는 이들에게 보내는 연대의 메시지입니다.
                우크라이나, 가자, 그리고 한반도. 우리는 서로의 얼굴도, 이름도 모르지만 같은 시대를 살아가며 평화를 염원하는 마음만은 하나로 연결되어 있습니다.
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
                <span className="w-8 h-8 rounded-full bg-jeju-ocean flex items-center justify-center text-white text-sm">02</span>
                12팀의 목소리
              </h3>
              <p className="typo-body text-gray-700 leading-loose">
                록, 포크, 재즈, 일렉트로닉.
                강정마을의 평화운동에 공감하는 12팀의 뮤지션들이 각자의 음악 언어로 평화를 번역했습니다.
                다양한 장르가 모여 만든 이 앨범은 다양성이야말로 평화의 본질임을 증명합니다.
              </p>
            </motion.div>

          </div>
        </div>
      </Section>

      {/* Release Commemoration Concerts - Integrated Tab Section */}
      <Section background="ocean-sand" className="!pb-0">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="발매 기념 공연"
            subtitle="음반 발매를 기념하여 강정과 서울에서 개최된 공연의 모든 기록을 확인해 보세요."
            className="!mb-8"
          />

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner border border-white/50">
              {[
                { id: 'info', label: '공연 개요' },
                { id: 'video', label: '현장 영상' },
                { id: 'photo', label: '현장 사진' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'text-white' : 'text-coastal-gray hover:text-jeju-ocean'
                    }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-jeju-ocean rounded-xl shadow-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
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
                              <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">일시</span>
                              <span className="font-medium">{concert.date} <span className="text-coastal-gray text-sm">{concert.time}</span></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-gray-700">
                            <div className="w-10 h-10 rounded-full bg-ocean-sand flex items-center justify-center text-jeju-ocean">
                              <MapPinIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">장소</span>
                              <span className="font-medium">{concert.venue}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-center gap-2 mb-4">
                            <UserGroupIcon className="w-4 h-4 text-jeju-ocean" />
                            <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold">출연진</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {concert.performers.map((performer, idx) => (
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
                            ))}
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
                  <Button
                    to="/videos?filter=album-2024"
                    variant="outline"
                  >
                    전체 영상 보기
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
                      <img
                        src={photo.url}
                        alt={`앨범 발매 기념 공연 현장 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-12">
                  <Button
                    to="/gallery?filter=album-2024"
                    variant="primary"
                  >
                    공연 사진 전체 보기
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
              Produced by <span className="text-jeju-ocean font-bold">강정피스앤뮤직캠프</span> · 2024
            </p>
          </motion.div>
        </div>
      </Section>
      {/* Modal */}
      {
        selectedMusician && (
          <MusicianModal
            musician={selectedMusician}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )
      }
      {selectedImage && (
        <ImageLightbox
          image={{
            url: selectedImage.url,
            alt: `앨범 발매 기념 공연 현장 ${selectedImage.id}`
          }}
          onClose={() => setSelectedImage(null)}
          maxHeight="85vh"
        />
      )}
    </PageLayout >
  );
};

export default AlbumAboutPage;
