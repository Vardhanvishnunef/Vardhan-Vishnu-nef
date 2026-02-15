
import React, { useState } from 'react';
import { Page } from '../types';
import { STATIC_IMAGES } from '../constants';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

interface StackProps {
  onNavigate: (page: Page) => void;
}

const Stack: React.FC<StackProps> = ({ onNavigate }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between py-12 px-6 overflow-hidden relative transition-colors duration-500">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 w-full">
        <div className="h-12 md:h-14">
          <Logo className="h-full w-40 md:w-56" />
        </div>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">The Stack</h1>
        <button className="material-symbols-outlined text-charcoal">menu</button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative perspective-[1000px] mt-10">
        {/* Mock Stack Layers */}
        <div className="absolute inset-0 bg-paper shadow-flat border border-border-paper transform -rotate-3 translate-y-4 scale-95 opacity-50"></div>
        <div className="absolute inset-0 bg-paper shadow-lifted border border-border-paper transform rotate-2 translate-y-2 scale-[0.98]"></div>

        {/* Main Card */}
        <div
          className={`relative w-full aspect-[4/5] cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front Face */}
          <div className="absolute inset-0 bg-paper border border-border-paper shadow-floating p-3 pb-12 [backface-visibility:hidden]">
            <div className="w-full h-full overflow-hidden bg-gray-100 relative group">
              <img
                src={STATIC_IMAGES.stack.main}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                alt="Stack item"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                <span className="bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">Tap to flip</span>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-end px-2">
              <div className="flex flex-col gap-1">
                <p className="font-hand text-3xl -rotate-1">Heritage Light, Jaipur</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Jan 14, 2024</p>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-lg font-variation-settings-'FILL'1">favorite</span>
                <span className="font-hand text-xl pt-1">512</span>
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 bg-paper border border-border-paper shadow-floating p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto no-scrollbar">
            <h3 className="text-xl font-bold mb-4">Architecture of Memory</h3>
            <p className="text-sm leading-relaxed text-muted mb-6">
              A documentary exploration of the geometric precision and weathered textures found in Rajasthan's heritage structures.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {['#architecture', '#documentary', '#jaipur'].map(tag => (
                <span key={tag} className="px-2 py-1 border border-border-paper text-[10px] uppercase font-bold text-muted">{tag}</span>
              ))}
            </div>
            <button className="w-full mt-10 py-4 border border-charcoal text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition-colors">
              View on Instagram
            </button>
          </div>
        </div>
      </main>

      <div className="flex items-center gap-12 text-muted opacity-60 pb-32">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">west</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Reject</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest">Keep</span>
          <span className="material-symbols-outlined text-sm">east</span>
        </div>
      </div>

      <Navigation active="stack" onNavigate={onNavigate} />
    </div>
  );
};

export default Stack;
