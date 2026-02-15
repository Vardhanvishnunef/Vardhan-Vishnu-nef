
import React, { useState } from 'react';
import { Page } from '../types';
import { MOCK_STILLS } from '../constants';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

interface StillsProps {
  onNavigate: (page: Page) => void;
}

const Stills: React.FC<StillsProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Portraits', 'Objects'];

  const filteredItems = MOCK_STILLS.filter(item =>
    activeFilter === 'All' || item.category === activeFilter
  );

  return (
    <div className="min-h-screen pb-32 transition-colors duration-500">
      <header className="sticky top-0 z-40 bg-limestone/95 dark:bg-[#1a1918]/95 backdrop-blur-md border-b border-border-paper/30 dark:border-white/10">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="h-12 md:h-14">
            <Logo className="h-full w-40 md:w-56" />
          </div>
          <div className="hidden sm:flex border border-border-paper bg-paper p-1 gap-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-charcoal text-white shadow-sm' : 'text-muted hover:text-charcoal hover:bg-limestone'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="group flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Menu</span>
            <span className="material-symbols-outlined text-lg">menu</span>
          </button>
        </div>
        {/* Mobile Filters */}
        <div className="sm:hidden px-6 pb-4 overflow-x-auto no-scrollbar">
          <div className="inline-flex gap-2 p-1 bg-[#EBE8E2] rounded-full shadow-inner">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-paper text-charcoal shadow-sm' : 'text-muted'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-12 px-6">
        <div className="mb-16 md:flex justify-between items-end">
          <div>
            <h1 className="text-5xl md:text-6xl font-light tracking-tight">Stills</h1>
            <p className="text-sm text-muted mt-4 max-w-sm leading-relaxed font-serif italic">
              A meticulous segregation of moments, exploring the tactile essence of light across subjects.
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Showing: {activeFilter}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <article
              key={item.id}
              className="group bg-paper p-5 shadow-lifted hover:shadow-floating transition-all duration-500 transform hover:-translate-y-1"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={item.imageUrl}
                  className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  alt={item.title}
                />
              </div>
              <div className="mt-5 flex justify-between items-end pt-4 border-t border-border-paper/30">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-charcoal">{item.title}</h3>
                  <p className="text-[10px] text-muted uppercase tracking-widest mt-1">{item.location}</p>
                </div>
                <span className="text-[10px] font-bold text-primary opacity-50">{item.subtitle}</span>
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-40 flex flex-col items-center justify-center py-10 opacity-40">
          <div className="h-16 w-[1px] bg-border-paper mb-6"></div>
          <span className="text-[10px] uppercase font-bold tracking-[0.5em]">Scroll to top</span>
        </footer>
      </main>

      <Navigation active="stills" onNavigate={onNavigate} />
    </div>
  );
};

export default Stills;
