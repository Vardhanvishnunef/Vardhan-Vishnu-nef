import React, { useEffect, useState } from 'react';
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

  if (!config) return <div className="min-h-screen bg-limestone" />;

  return (
    <div
      className="min-h-screen bg-limestone flex flex-col items-center justify-center cursor-pointer group px-6"
      onClick={onOpen}
    >
      <div className="w-full max-w-lg space-y-20">
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
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted animate-pulse">Enter Portfolio</span>
            <div className="h-12 w-[1px] bg-charcoal/20 group-hover:h-16 transition-all duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cover;
