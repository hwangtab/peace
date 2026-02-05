import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Navigation from './Navigation';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  return (
    <div className="min-h-screen bg-ocean-sand">
      <Navigation />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="pt-16"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
