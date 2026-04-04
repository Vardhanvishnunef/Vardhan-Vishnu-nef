import React, { useEffect, useState } from 'react';
import { Page, SiteConfig } from '../types';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';
import { resolvePublicUrl } from '../utils/resolveUrl';

interface StackProps {
  onNavigate: (page: Page) => void;
}

const Stack: React.FC<StackProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    fetch(`${base}data/site-config.json`, { cache: 'no-store' })
      .then(res => res.json())
      .then(setConfig)
      .catch(err => console.error('Failed to load stack config:', err));
  }, []);

  if (!config) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-limestone/95 backdrop-blur-md px-6 py-5 flex justify-between items-center border-b border-charcoal/5">
        <div className="h-12 md:h-14">
          <Logo className="h-full w-40 md:w-56" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-5">
            <div className="bg-paper p-4 shadow-lifted border border-border-paper/40">
              <img src={resolvePublicUrl(config.stack.main)} alt="Stack" className="w-full grayscale brightness-90 hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>

          <div className="md:col-span-7 space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-light tracking-tight">The Stack</h1>
              <p className="text-lg text-muted font-serif italic max-w-lg">A curated list of tools and gear used to capture and process these moments.</p>
            </div>

            <div className="space-y-16">
              {config.stack?.sections?.map((section, idx) => (
                <div key={idx} className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary border-b border-primary/20 pb-4">{section.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {section.items?.map((item, i) => (
                      <div key={i} className="group">
                        <h4 className="text-sm font-bold text-charcoal mb-1">{item.name}</h4>
                        <p className="text-[10px] text-muted uppercase tracking-widest">{item.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Navigation active="stack" onNavigate={onNavigate} />
    </div>
  );
};

export default Stack;
