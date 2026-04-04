import React, { useEffect, useState } from 'react';
import { Page, SiteConfig } from '../types';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';
import { resolvePublicUrl } from '../utils/resolveUrl';

interface InfoProps {
  onNavigate: (page: Page) => void;
}

const Info: React.FC<InfoProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    fetch(`${base}data/site-config.json`, { cache: 'no-store' })
      .then(res => res.json())
      .then(setConfig)
      .catch(err => console.error('Failed to load info config:', err));
  }, []);

  if (!config) return <div className="min-h-screen bg-limestone" />;

  const { info } = config;

  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-limestone/95 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-charcoal/5">
        <div className="h-14 md:h-16 flex items-center">
          <Logo className="h-full w-48 md:w-64" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          {/* Left Column: Profile & Bio */}
          <div className="md:col-span-5 space-y-12">
            <div className="bg-paper p-4 shadow-lifted border border-border-paper/40">
              <div className="aspect-[4/5] overflow-hidden grayscale contrast-110">
                <img src={resolvePublicUrl(info.profile)} alt={info.name} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-charcoal">{info.name}</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted mt-2">{info.role}</p>
              </div>
              <p className="text-lg font-serif italic text-muted leading-relaxed">"{info.quote}"</p>
              <div className="text-base text-charcoal/80 leading-relaxed font-medium space-y-4">
                {info.bio.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            <div className="pt-12 border-t border-charcoal/10 space-y-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted">Availability / Contact</h3>
              <div className="space-y-4">
                <p className="text-2xl font-bold text-charcoal">{info.availability}</p>
                <div className="flex flex-col gap-2">
                  <a href={`mailto:${info.contact.email}`} className="text-sm font-bold border-b border-charcoal w-fit pb-1 hover:text-primary hover:border-primary transition-all">{info.contact.email}</a>
                  <a href={`https://instagram.com/${info.contact.instagram}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold border-b border-charcoal w-fit pb-1 hover:text-primary hover:border-primary transition-all">@{info.contact.instagram}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Creative Thoughts */}
          <div className="md:col-span-7 sticky top-32">
            <div className="space-y-2 mb-10">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted">Creative Thoughts</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted/60">Stream of Consciousness</p>
            </div>
            <div className="space-y-6">
              {info.creative_thoughts?.map((thought, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${thought.role === 'admin' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-5 text-sm font-medium tracking-tight leading-snug ${thought.role === 'admin'
                      ? 'bg-charcoal text-white'
                      : 'bg-white border border-charcoal/10 text-charcoal'
                    }`}
                  >
                    {thought.text}
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted mt-2 px-1">
                    {thought.role === 'admin' ? 'Vardhan' : 'Reflection'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Navigation active="info" onNavigate={onNavigate} />
    </div>
  );
};

export default Info;
