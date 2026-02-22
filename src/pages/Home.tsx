import React, { useEffect, useState } from 'react';
import { Page, SiteConfig } from '../types';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetch('data/site-config.json')
      .then(res => res.json())
      .then(setConfig)
      .catch(err => console.error('Failed to load home config:', err));
  }, []);

  if (!config) return <div className="min-h-screen bg-limestone flex items-center justify-center"><p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Loading Environment...</p></div>;

  return (
    <div className="min-h-screen pb-32 transition-colors duration-500">
      <header className="sticky top-0 z-40 bg-limestone/95 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-charcoal/5">
        <div className="h-14 md:h-16 flex items-center">
          <Logo className="h-full w-48 md:w-64" />
        </div>
        <div className="flex items-center gap-6">
          <a href={`https://www.instagram.com/${config.info?.contact?.instagram}/`} target="_blank" rel="noopener noreferrer" className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors">
            @{config.info?.contact?.instagram || 'instagram'}
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-12 px-6">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-charcoal">{config.home?.title || 'Untitled'}</h1>
          <p className="text-[10px] md:text-xs text-muted font-bold tracking-[0.3em] mt-4 uppercase">{config.home?.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {config.home?.items?.map((item, idx) => (
            <section
              key={item.id}
              className={`group flex flex-col ${idx % 2 === 1 ? 'md:mt-32' : ''}`}
            >
              <div className="bg-paper p-4 md:p-6 shadow-lifted border border-border-paper/40 transition-all duration-500 hover:shadow-floating">
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    className="w-full h-full object-cover grayscale contrast-110 brightness-95 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                    alt={item.title}
                  />
                </div>
                <div className="mt-6 flex justify-between items-baseline">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-charcoal">{item.title}</h3>
                    <p className="text-[10px] font-bold text-muted tracking-widest uppercase mt-1">{item.category}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted/60">{item.subtitle}</span>
                </div>
                {item.description && (
                  <p className="mt-6 text-sm md:text-base font-serif italic text-muted leading-relaxed max-w-sm">
                    {item.description}
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Instagram Teaser Section */}
        <section className="mt-40 border-t border-charcoal/10 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Recent from Instagram</h2>
              <p className="text-xs text-muted font-bold tracking-[0.2em] mt-2 uppercase">Live Feed Updates</p>
            </div>
            <a
              href={`https://www.instagram.com/${config.info?.contact?.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-charcoal text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all"
            >
              Follow @{config.info?.contact?.instagram || 'instagram'}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.home?.instagram_grid?.map((url, i) => (
              <div key={i} className="aspect-square bg-paper border border-border-paper shadow-flat overflow-hidden group cursor-pointer">
                <img
                  src={url}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  alt="IG item"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col items-center justify-center gap-6 py-32 opacity-30">
          <div className="h-20 w-[1px] bg-charcoal"></div>
          <span className="text-[10px] uppercase font-bold tracking-[0.4em]">Fin</span>
        </div>
      </main>

      <Navigation active="home" onNavigate={onNavigate} />
    </div>
  );
};

export default Home;
