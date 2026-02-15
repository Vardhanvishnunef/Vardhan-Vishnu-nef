import React, { useState, useEffect } from 'react';
import { Page, StoryData } from '../types';
import Navigation from './Navigation';
import Logo from './Logo';
import { loadDescriptions, DescriptionMap } from '../services/descriptionService';
// Adjusted path if needed, check imports

interface StoryLayoutProps {
    story: StoryData;
    onNavigate: (page: Page) => void;
}

const StoryLayout: React.FC<StoryLayoutProps> = ({ story, onNavigate }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [carouselImages, setCarouselImages] = useState<string[]>([]);
    const [polaroidImages, setPolaroidImages] = useState<string[]>([]);
    const [descriptions, setDescriptions] = useState<DescriptionMap>({});

    useEffect(() => {
        loadDescriptions().then(setDescriptions);
    }, []);

    useEffect(() => {
        // Dynamically load images based on structure
        // Carousel images: /public/images/stories/[slug]/carousel/*.{jpg,png,webp}
        // Polaroid images: /public/images/stories/[slug]/*.{jpg,png,webp} (excluding hero/thumbnail)

        // Note: In Vite, import.meta.glob keys are relative to project root
        const allCarouselImages = import.meta.glob('/public/images/stories/*/carousel/*.webp', { eager: true, as: 'url' });
        const allStoryImages = import.meta.glob('/public/images/stories/*/*.webp', { eager: true, as: 'url' });

        // Filter for current story
        const currentCarouselPaths = Object.keys(allCarouselImages).filter(path =>
            path.includes(`/stories/${story.slug}/carousel/`)
        ).map(path => import.meta.env.BASE_URL + path.replace(/^\/public\//, ''));

        const currentPolaroidPaths = Object.keys(allStoryImages).filter(path =>
            path.includes(`/stories/${story.slug}/`) &&
            !path.includes('hero.') &&
            !path.includes('thumbnail.') &&
            !path.includes('/carousel/') // Exclude carousel images from polaroids
        ).map(path => import.meta.env.BASE_URL + path.replace(/^\/public\//, ''));

        // Randomize polaroids if needed, or just take them all.
        // User asked for "remaining photos will stay in main folder and randomly picked"
        // Let's shuffle and pick up to 6
        const shuffledPolaroids = currentPolaroidPaths.sort(() => 0.5 - Math.random()).slice(0, 6);

        // If no carousel images found (e.g. for mock stories), use placeholders or empty
        if (currentCarouselPaths.length > 0) {
            setCarouselImages(currentCarouselPaths);
        } else {
            // Fallback for demo if folders are empty
            setCarouselImages([]);
        }

        if (shuffledPolaroids.length > 0) {
            setPolaroidImages(shuffledPolaroids);
        } else {
            // Fallback
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
            <header className="sticky top-0 z-40 bg-limestone/95 dark:bg-[#1a1918]/95 backdrop-blur-md border-b border-border-paper/30 dark:border-white/10">
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
                    <div className="w-10"></div> {/* Spacer for alignment */}
                </div>
            </header>

            <main className="max-w-6xl mx-auto pt-10 px-6">
                <div className="text-center mb-16 animate-[fadeIn_1s_ease-out]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">{story.location} • {story.date}</span>
                    <h1 className="text-5xl md:text-7xl font-light tracking-tight text-charcoal dark:text-limestone mb-8">{story.client}</h1>
                    <p className="max-w-2xl mx-auto text-sm text-muted leading-relaxed font-serif italic">
                        "{story.description}"
                    </p>
                </div>

                {/* Carousel */}
                {carouselImages.length > 0 ? (
                    <section className="mb-24 flex justify-center">
                        {/* Dynamic Container: fits the image size */}
                        <div className="relative group w-fit h-auto max-w-full shadow-lifted">
                            <img
                                src={carouselImages[activeSlide]}
                                alt={`Gallery slide ${activeSlide + 1}`}
                                className="max-h-[80vh] max-w-full w-auto h-auto object-contain transition-all duration-700 block"
                            />

                            {/* Carousel Controls */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                {carouselImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveSlide(idx)}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${activeSlide === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className="text-center mb-24 py-20 bg-limestone/50 rounded-lg border border-dashed border-charcoal/20">
                        <p className="text-muted text-sm font-bold uppercase tracking-widest">No carousel images found</p>
                    </div>
                )}

                {/* Polaroid Grid */}
                {polaroidImages.length > 0 ? (
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-16 px-4 md:px-20">
                        {polaroidImages.map((img, idx) => (
                            <PolaroidCard key={idx} img={img} idx={idx} manualDescription={descriptions[img]} />
                        ))}
                    </section>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted/50 text-xs font-bold uppercase tracking-widest">Add images to story folder to populate polaroids</p>
                    </div>
                )}

                <footer className="mt-40 text-center opacity-40">
                    <span className="text-[10px] uppercase font-bold tracking-[0.5em]">End of Story</span>
                </footer>
            </main>

            <Navigation active="index" onNavigate={onNavigate} />
        </div>
    );
};

const PolaroidCard: React.FC<{ img: string; idx: number; manualDescription?: string }> = ({ img, idx, manualDescription }) => {
    const [description, setDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (description || loading) return;

        setLoading(true);
        try {
            // Import dynamically to avoid circular dependencies if any, though here it's fine
            const { geminiService } = await import('../services/geminiService');
            const desc = await geminiService.generateImageDescription(img);
            setDescription(desc);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`bg-white p-6 pb-20 shadow-floating transform transition-all duration-500 hover:scale-105 hover:z-10 hover:rotate-0 group relative
                ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}
                ${idx % 3 === 0 ? 'md:translate-y-12' : ''}
              `}
        >
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden mb-6 grayscale hover:grayscale-0 transition-all duration-700 relative">
                <img src={img} alt={`Polaroid ${idx + 1}`} className="w-full h-full object-cover" />

                {/* AI Analyze Button - Only show if no manual description */}
                {!description && !manualDescription && (
                    <button
                        onClick={handleAnalyze}
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-charcoal p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                        title="Analyze with AI"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        )}
                    </button>
                )}
            </div>

            <div className="font-handwriting text-center text-charcoal/80 text-xl rotate-[-1deg] min-h-[3em] flex flex-col justify-center items-center px-4">
                {manualDescription ? (
                    <p className="text-sm font-serif italic text-charcoal/70 animate-[fadeIn_0.5s_ease-out] leading-relaxed">
                        "{manualDescription}"
                    </p>
                ) : description ? (
                    <p className="text-sm font-serif italic text-charcoal/70 animate-[fadeIn_0.5s_ease-out] leading-relaxed">
                        "{description}"
                    </p>
                ) : (
                    <span>No. {idx + 1}</span>
                )}
            </div>
        </div>
    );
};

export default StoryLayout;
