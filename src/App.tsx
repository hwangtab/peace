import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { ROUTES } from './constants/routes';
import Navigation from './components/layout/Navigation';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorFallback from './components/common/ErrorFallback';
import Footer from './components/layout/Footer';

import HeroSection from './components/home/HeroSection';
import AboutSection from './components/home/AboutSection';
import TimelineSection from './components/home/TimelineSection';
import GallerySection from './components/home/GallerySection';
import SEOHelmet from './components/shared/SEOHelmet';
import WaveDivider from './components/common/WaveDivider';
import { getWebSiteSchema, getOrganizationSchema, getFAQSchema } from './utils/structuredData';
import { seoFaqs } from './data/seo-faq';

// Lazy load route-specific pages
const PressPage = lazy(() => import('./components/press/PressPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const VideoPage = lazy(() => import('./components/videos/VideoPage'));
const Camp2023Page = lazy(() => import('./pages/Camp2023Page'));
const Camp2025Page = lazy(() => import('./pages/Camp2025Page'));
const Camp2026Page = lazy(() => import('./pages/Camp2026Page'));
const AlbumMusiciansPage = lazy(() => import('./pages/album/AlbumMusiciansPage'));
const AlbumTracksPage = lazy(() => import('./pages/album/AlbumTracksPage'));
const AlbumAboutPage = lazy(() => import('./pages/album/AlbumAboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Pages will be imported here
const HomePage = () => {
  const structuredData = [
    getWebSiteSchema(),
    getOrganizationSchema(),
    getFAQSchema(seoFaqs)
  ];

  return (
    <div>
      <SEOHelmet
        title="강정피스앤뮤직캠프 | 노래하자, 춤추자, 전쟁을 끝내자"
        description="제주 강정마을에서 시작되는 평화를 위한 음악 프로젝트. 2026년 6월 5일-7일 강정체육공원에서 열리는 반전 평화 음악 축제. 전세계 분쟁 지역의 평화를 염원하며 함께 노래합니다."
        keywords="강정피스앤뮤직캠프, 평화축제, 제주도축제, 음악캠프, 반전평화, 강정마을, 2026공연, 인디밴드공연, 평화운동, 제주공연"
        structuredData={structuredData}
      />
      <HeroSection imageUrl="/images-webp/camps/2023/DSC00437.webp" />
      <AboutSection />
      <WaveDivider className="text-sunlight-glow -mt-[60px] sm:-mt-[100px] relative z-10" />
      <TimelineSection />
      <WaveDivider className="text-golden-sun -mt-[60px] sm:-mt-[100px] relative z-10" />
      <GallerySection />
    </div>
  );
};



// Loading fallback component for lazy-loaded pages
const PageLoadingSpinner = () => (
  <div className="min-h-screen bg-light-beige flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-sage mx-auto mb-4" />
      <p className="text-gray-600 font-serif">로딩 중...</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div className="app-wrapper">
      <AnimatePresence mode="wait" initial={false}>
        <Suspense fallback={<PageLoadingSpinner />}>
          <Routes location={location}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.LEGACY.MUSICIANS} element={<Navigate to={ROUTES.ALBUM.MUSICIANS} replace />} />
            <Route path={ROUTES.LEGACY.TRACKS} element={<Navigate to={ROUTES.ALBUM.TRACKS} replace />} />
            <Route path={ROUTES.ALBUM.MUSICIANS} element={<AlbumMusiciansPage />} />
            <Route path={ROUTES.ALBUM.TRACKS} element={<AlbumTracksPage />} />
            <Route path={ROUTES.GALLERY} element={<GalleryPage />} />
            <Route path={ROUTES.VIDEOS} element={<VideoPage />} />
            <Route path={ROUTES.PRESS} element={<PressPage />} />
            {/* Redirect /camps to latest camp */}
            <Route path={ROUTES.CAMPS.ROOT} element={<Navigate to={ROUTES.CAMPS.CAMP_2026} replace />} />
            <Route path={ROUTES.CAMPS.CAMP_2023} element={<Camp2023Page />} />
            <Route path={ROUTES.CAMPS.CAMP_2025} element={<Camp2025Page />} />
            <Route path={ROUTES.CAMPS.CAMP_2026} element={<Camp2026Page />} />
            <Route path={ROUTES.ALBUM.ABOUT} element={<AlbumAboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <ScrollToTop />
        <Navigation />
        <AnimatedRoutes />
        <Footer />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
