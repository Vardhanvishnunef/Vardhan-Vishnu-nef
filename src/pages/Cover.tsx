import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SiteConfig } from '../types';
import Logo from '../components/Logo';

interface CoverProps {
  onOpen: () => void;
}

const Cover: React.FC<CoverProps> = ({ onOpen }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetch('data/site-config.json')
      .then(res => res.json())
      .then(setConfig)
      .catch(err => console.error('Failed to load cover config:', err));
  }, []);

  if (!config) return <div className="min-h-screen" />;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center cursor-pointer group px-6"
      onClick={onOpen}
    >
      <div className="w-full max-w-lg space-y-12">
        <div className="relative aspect-[4/5] overflow-hidden grayscale contrast-125 transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-[1.02] shadow-lifted">
          <img
            src={config.cover.hero}
            alt="Cover Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/10 mix-blend-overlay"></div>
        </div>

        <div className="space-y-8 flex flex-col items-center">
          <div className="h-16 md:h-20">
            <Logo className="h-full w-56 md:w-72" />
          </div>
          <motion.div
            className="flex flex-col items-center gap-4 pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted group-hover:text-charcoal group-hover:tracking-[0.6em] transition-all duration-700 ease-out">
              Enter Portfolio
            </span>
            <div className="h-12 w-[1.5px] bg-charcoal/20 group-hover:h-20 group-hover:bg-primary transition-all duration-1000 ease-in-out"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cover;
