import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/layout/Navigation';
import HeroSection from './components/home/HeroSection';
import AboutSection from './components/home/AboutSection';
import TimelineSection from './components/home/TimelineSection';
import GallerySection from './components/home/GallerySection';

// Lazy load route-specific pages
const PressPage = lazy(() => import('./components/press/PressPage'));
const VideoPage = lazy(() => import('./components/videos/VideoPage'));
const CampsPage = lazy(() => import('./pages/CampsPage'));
const Camp2023Page = lazy(() => import('./pages/Camp2023Page'));
const Camp2025Page = lazy(() => import('./pages/Camp2025Page'));
const Camp2026Page = lazy(() => import('./pages/Camp2026Page'));
const AlbumMusiciansPage = lazy(() => import('./pages/album/AlbumMusiciansPage'));
const AlbumTracksPage = lazy(() => import('./pages/album/AlbumTracksPage'));
const AlbumAboutPage = lazy(() => import('./pages/album/AlbumAboutPage'));
import SEOHelmet from './components/shared/SEOHelmet';

// Pages will be imported here
const HomePage = () => (
  <div>
    <SEOHelmet />
    <HeroSection imageUrl="/images-webp/camps/2023/20230600.편집.29.webp" />
    <AboutSection />
    <TimelineSection />
    <GallerySection />
  </div>
);

const GalleryPage = () => (
  <div className="min-h-screen bg-light-beige">
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
            <Route path="/" element={<HomePage />} />
            <Route path="/musicians" element={<Navigate to="/album/musicians" replace />} />
            <Route path="/tracks" element={<Navigate to="/album/tracks" replace />} />
            <Route path="/album/musicians" element={<AlbumMusiciansPage />} />
            <Route path="/album/tracks" element={<AlbumTracksPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/videos" element={<VideoPage />} />
            <Route path="/press" element={<PressPage />} />
            <Route path="/camps" element={<CampsPage />} />
            <Route path="/camps/2023" element={<Camp2023Page />} />
            <Route path="/camps/2025" element={<Camp2025Page />} />
            <Route path="/camps/2026" element={<Camp2026Page />} />
            <Route path="/album/about" element={<AlbumAboutPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Navigation />
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
