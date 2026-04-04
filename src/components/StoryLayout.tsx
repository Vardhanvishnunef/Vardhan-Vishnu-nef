import React, { useState, useEffect } from 'react';
import { Page, StoryData } from '../types';
import Navigation from './Navigation';
import Logo from './Logo';
import { resolvePublicUrl } from '../utils/resolveUrl';
import { loadDescriptions, Description } from '../services/descriptionService';

interface StoryLayoutProps {
    story: StoryData;
    onNavigate: (page: Page) => void;
}

const StoryLayout: React.FC<StoryLayoutProps> = ({ story, onNavigate }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [carouselImages, setCarouselImages] = useState<string[]>([]);
    const [polaroidImages, setPolaroidImages] = useState<string[]>([]);
    const [descriptions, setDescriptions] = useState<Record<string, Description>>({});

    useEffect(() => {
        loadDescriptions().then(setDescriptions);
    }, []);

    useEffect(() => {
        const allCarouselImages = import.meta.glob('/public/images/stories/*/carousel/*.webp', { eager: true, query: '?url', import: 'default' });
        const allStoryImages = import.meta.glob('/public/images/stories/*/*.webp', { eager: true, query: '?url', import: 'default' });

        const currentCarouselPaths = Object.keys(allCarouselImages).filter(path =>
            path.includes(`/stories/${story.slug}/carousel/`)
        ).map(path => resolvePublicUrl(path));

        const currentPolaroidPaths = Object.keys(allStoryImages).filter(path =>
            path.includes(`/stories/${story.slug}/`) &&
            !path.includes('hero.') &&
            !path.includes('thumbnail.') &&
            !path.includes('/carousel/')
        ).map(path => resolvePublicUrl(path));

        const shuffledPolaroids = currentPolaroidPaths.sort(() => 0.5 - Math.random()).slice(0, 6);

        if (currentCarouselPaths.length > 0) {
            setCarouselImages(currentCarouselPaths);
        } else {
            setCarouselImages([]);
        }

        if (shuffledPolaroids.length > 0) {
            setPolaroidImages(shuffledPolaroids);
        } else {
            setPolaroidImages([]);
        }
    }, [story.slug]);

    const nextSlide = () => {
        if (carouselImages.length === 0) return;
        setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    };

    const prevSlide = () => {
        if (carouselImages.length === 0) return;
        setActiveSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    };

    return (
        <div className="min-h-screen pb-40 transition-colors duration-500">
            <header className="sticky top-0 z-40 bg-limestone/95 backdrop-blur-md border-b border-border-paper/30">
                <div className="flex items-center justify-between px-6 py-5">
                    <button
                        onClick={() => onNavigate('index')}
                        className="flex items-center gap-2 px-4 py-2 border border-charcoal/30 bg-white/50 backdrop-blur-md hover:bg-charcoal hover:text-white hover:border-charcoal transition-all rounded-full group shadow-sm z-10"
                    >
                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
                    </button>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 md:h-14">
                        <Logo className="h-full w-40 md:w-64" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto pt-10 px-6">
                <div className="text-center mb-16 animate-[fadeIn_1s_ease-out]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">{story.location} • {story.date}</span>
                    <h1 className="text-5xl md:text-7xl font-light tracking-tight text-charcoal mb-8">{story.client}</h1>
                    <p className="max-w-2xl mx-auto text-sm text-muted leading-relaxed font-serif italic">
                        "{story.description}"
                    </p>
                </div>

                {carouselImages.length > 0 ? (
                    <section className="mb-24 flex flex-col items-center">
                        <div className="relative group w-fit h-auto max-w-full shadow-lifted bg-paper/20">
                            {/* Main Carousel Image with Fade Effect */}
                            <img
                                key={activeSlide} // Adding key forces a fresh render/transition for the frame
                                src={carouselImages[activeSlide]}
                                alt={`Gallery slide ${activeSlide + 1}`}
                                className="max-h-[85vh] max-w-full w-auto h-auto object-contain transition-all duration-1000 ease-in-out block animate-[fadeIn_0.8s_ease-out]"
                                loading="eager"
                            />
                            
                            {/* Preload Next/Prev Images */}
                            <div className="hidden pointer-events-none">
                                {carouselImages.map((img, i) => (
                                    <img key={i} src={img} alt="Preload" />
                                ))}
                            </div>

                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-full hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                            >
                                <span className="material-symbols-outlined text-2xl">chevron_left</span>
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-full hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                            >
                                <span className="material-symbols-outlined text-2xl">chevron_right</span>
                            </button>
                            
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-3 bg-charcoal/20 backdrop-blur-md rounded-full border border-white/10">
                                {carouselImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveSlide(idx)}
                                        className={`w-2 h-2 rounded-full transition-all duration-500 ${activeSlide === idx ? 'bg-white w-6 shadow-[0_0_10px_white]' : 'bg-white/40 hover:bg-white/70'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4 opacity-50 text-[10px] font-bold uppercase tracking-[0.3em]">
                            <span>{activeSlide + 1}</span>
                            <span className="text-charcoal/20">/</span>
                            <span>{carouselImages.length}</span>
                        </div>
                    </section>
                ) : null}

                <section className="grid grid-cols-1 md:grid-cols-2 gap-16 px-4 md:px-20">
                    {polaroidImages.map((img, idx) => (
                        <PolaroidCard key={idx} img={img} idx={idx} description={descriptions[img]} />
                    ))}
                </section>

                <footer className="mt-40 text-center opacity-40">
                    <span className="text-[10px] uppercase font-bold tracking-[0.5em]">End of Story</span>
                </footer>
            </main>

            <Navigation active="index" onNavigate={onNavigate} />
        </div>
    );
};

const PolaroidCard: React.FC<{ img: string; idx: number; description?: Description }> = ({ img, idx, description }) => {
    const handleRedirection = () => {
        if (description?.instagramUrl) {
            window.open(description.instagramUrl, '_blank');
        }
    };

    return (
        <div
            onClick={handleRedirection}
            className={`bg-white p-6 pb-20 shadow-floating transform transition-all duration-500 hover:scale-105 hover:z-10 hover:rotate-0 group relative cursor-pointer
                ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}
                ${idx % 3 === 0 ? 'md:translate-y-12' : ''}
              `}
        >
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden mb-6 grayscale hover:grayscale-0 transition-all duration-700 relative">
                <img src={img} alt={`Polaroid ${idx + 1}`} className="w-full h-full object-cover" />
                {description?.instagramUrl && (
                    <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <img src="https://www.instagram.com/static/images/ico/favicon.ico/36b304827462.ico" className="w-4 h-4" alt="Instagram" />
                    </div>
                )}
            </div>

            <div className="font-handwriting text-center text-charcoal/80 text-xl min-h-[3em] flex flex-col justify-center items-center px-4">
                {description?.text ? (
                    <p className="text-sm font-serif italic text-charcoal/70 animate-[fadeIn_0.5s_ease-out] leading-relaxed">
                        "{description.text}"
                    </p>
                ) : (
                    <span>No. {idx + 1}</span>
                )}
            </div>
        </div >
    );
};

export default StoryLayout;
