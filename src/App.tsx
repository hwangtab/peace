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

// Pages will be imported here
const HomePage = () => (
  <div>
    <SEOHelmet />
    <HeroSection imageUrl="/images-webp/camps/2023/DSC00437.webp" />
    <AboutSection />
    <TimelineSection />
    <GallerySection />
  </div>
);



// Loading fallback component for lazy-loaded pages
const PageLoadingSpinner = () => (
  <div className="min-h-screen bg-light-beige flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-sage mx-auto mb-4"></div>
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
          <Routes location={location} key={location.pathname}>
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
