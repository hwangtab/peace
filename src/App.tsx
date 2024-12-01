import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/layout/Navigation';
import HeroSection from './components/home/HeroSection';
import AboutSection from './components/home/AboutSection';
import MusiciansSection from './components/home/MusiciansSection';
import TracksSection from './components/home/TracksSection';
import GallerySection from './components/home/GallerySection';
import PressPage from './components/press/PressPage';
import VideoPage from './components/videos/VideoPage';

// Pages will be imported here
const HomePage = () => (
  <div>
    <HeroSection />
    <AboutSection />
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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/musicians" element={<MusiciansPage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/videos" element={<VideoPage />} />
        <Route path="/press" element={<PressPage />} />
      </Routes>
    </AnimatePresence>
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
