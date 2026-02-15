
import React from 'react';
import { STATIC_IMAGES } from '../constants';
import ParallaxWrapper from '../components/ParallaxWrapper';
import Logo from '../components/Logo';

interface CoverProps {
  onOpen: () => void;
}

const Cover: React.FC<CoverProps> = ({ onOpen }) => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-between py-16 px-6 relative overflow-hidden transition-colors duration-500 dark:bg-[#111]">
      <header className="text-center z-10 animate-[fadeIn_1s_ease-out]">
        <div className="w-full max-w-md md:max-w-xl mx-auto mb-8 px-4 cursor-pointer">
          {/* Logo Component handles blending */}
          <Logo className="w-full h-auto" interactive={true} highContrast={true} />
        </div>
        <p className="text-xs font-medium tracking-[0.15em] text-muted uppercase">Portfolio '24</p>
      </header>

      <ParallaxWrapper className="relative w-full max-w-sm aspect-[3/4] group cursor-pointer" onClick={onOpen}>
        <div className="absolute inset-0 bg-paper shadow-floating p-4 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-4 group-hover:rotate-1">
          <div className="w-full h-full relative overflow-hidden bg-gray-100 grayscale hover:grayscale-0 transition-all duration-700">
            <img
              src={STATIC_IMAGES.cover.hero}
              className="w-full h-full object-cover"
              alt="Hero cover portrait"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none"></div>
          </div>
        </div>
      </ParallaxWrapper>

      <footer className="w-full flex flex-col items-center gap-4 z-10">
        <button
          onClick={onOpen}
          className="group relative flex flex-col items-center gap-2"
        >
          <div className="h-16 w-[1px] bg-muted/30 overflow-hidden relative">
            <div className="h-full w-full bg-primary absolute top-0 animate-slide-down"></div>
          </div>
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary group-hover:tracking-[0.4em] transition-all">
            Open
          </span>
        </button>
      </footer>
    </div>
  );
};

export default Cover;
