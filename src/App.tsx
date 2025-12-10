import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/layout/Navigation';
import HeroSection from './components/home/HeroSection';
import AboutSection from './components/home/AboutSection';
import TimelineSection from './components/home/TimelineSection';
import MusiciansSection from './components/home/MusiciansSection';
import TracksSection from './components/home/TracksSection';
import GallerySection from './components/home/GallerySection';
import PressPage from './components/press/PressPage';
import VideoPage from './components/videos/VideoPage';
import Camp2023Page from './pages/Camp2023Page';
import Camp2025Page from './pages/Camp2025Page';
import AlbumMusiciansPage from './pages/album/AlbumMusiciansPage';
import AlbumTracksPage from './pages/album/AlbumTracksPage';

// Pages will be imported here
const HomePage = () => (
  <div>
    <HeroSection />
    <AboutSection />
    <TimelineSection />
    <MusiciansSection />
    <TracksSection />
  </div>
);

const MusiciansPage = () => (
  <div className="min-h-screen bg-light-beige">
    <MusiciansSection />
  </div>
);

const TracksPage = () => (
  <div className="min-h-screen bg-light-beige">
    <TracksSection />
  </div>
);

const GalleryPage = () => (
  <div className="min-h-screen bg-light-beige">
    <GallerySection />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <div className="app-wrapper">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/musicians" element={<Navigate to="/album/musicians" replace />} />
          <Route path="/tracks" element={<Navigate to="/album/tracks" replace />} />
          <Route path="/album/musicians" element={<AlbumMusiciansPage />} />
          <Route path="/album/tracks" element={<AlbumTracksPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/videos" element={<VideoPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/camps/2023" element={<Camp2023Page />} />
          <Route path="/camps/2025" element={<Camp2025Page />} />
        </Routes>
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
