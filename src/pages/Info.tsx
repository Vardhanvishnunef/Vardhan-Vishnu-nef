
import React from 'react';
import { Page } from '../types';
import { STATIC_IMAGES } from '../constants';
import Navigation from '../components/Navigation';

interface InfoProps {
  onNavigate: (page: Page) => void;
}

const Info: React.FC<InfoProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col items-center pt-12 pb-44 px-6">
      <div className="w-full max-w-lg flex justify-between items-end mb-12 border-b border-border-paper pb-4">
        <div className="flex items-center gap-3 text-primary">
          <span className="material-symbols-outlined text-xl">badge</span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em]">Identity</span>
        </div>
        <span className="text-[10px] font-bold text-muted uppercase tracking-[0.4em]">Folio 2024</span>
      </div>

      <div className="w-full max-w-lg bg-paper shadow-floating border border-white/60 p-8 md:p-16 flex flex-col items-center gap-10 group relative overflow-hidden">
        {/* Subtle Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-limestone/50 -rotate-45 translate-x-12 -translate-y-12 border border-border-paper"></div>

        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lifted border-4 border-white grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105">
            <img
              src={STATIC_IMAGES.info.profile}
              className="w-full h-full object-cover"
              alt="Vardhan Vishnu Profile"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg">
            <span className="material-symbols-outlined text-sm">verified</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-charcoal">VARDHAN VISHNU</h1>
          <p className="text-[10px] font-bold tracking-[0.4em] text-muted uppercase mt-3">Cinematic Photographer</p>
        </div>

        <div className="h-px w-20 bg-primary/20"></div>

        <div className="space-y-6">
          <p className="text-sm md:text-base leading-relaxed text-charcoal/80 font-serif italic text-center px-4">
            "Photography is not about seeing, but about feeling. I seek to capture the tactile nature of memory through light, texture, and silence."
          </p>
          <p className="text-sm leading-relaxed text-justify text-charcoal/70">
            Based in Mumbai, Vardhan Vishnu specializes in a cinematic documentary style that treats every wedding or portrait as a timeless artifact. His work is defined by earthy tones, cinematic compositions, and an intimate understanding of Indian traditions.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-border-paper/40">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Direct</span>
            <a href="mailto:hello@vardhanvishnu.com" className="block text-sm font-bold hover:text-primary transition-colors">hello@vardhanvishnu.com</a>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Social</span>
            <a href="https://www.instagram.com/vardhanvishnu.nef/" target="_blank" className="block text-sm font-bold hover:text-primary transition-colors">@vardhanvishnu.nef</a>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Studio</span>
            <span className="block text-sm font-bold">Mumbai • Global</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Availability</span>
            <span className="block text-sm font-bold text-primary">Booking Winter '24</span>
          </div>
        </div>

        <button className="w-full py-5 bg-charcoal text-white relative group overflow-hidden shadow-floating active:scale-[0.98] transition-all">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Request Rates</span>
            <span className="material-symbols-outlined text-white text-sm group-hover:translate-x-1 transition-transform">send</span>
          </div>
        </button>
      </div>

      <div className="mt-16 text-center space-y-2">
        <p className="text-[10px] font-bold text-muted/40 uppercase tracking-[0.4em]">
          Est. 2018 • Captured with Intention
        </p>
        <p className="text-[9px] text-muted/30 uppercase tracking-[0.2em]">
          © 2024 VARDHAN VISHNU
        </p>
      </div>

      <Navigation active="info" onNavigate={onNavigate} />
    </div>
  );
};

export default Info;
