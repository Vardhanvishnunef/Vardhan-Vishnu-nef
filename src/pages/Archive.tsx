import React from 'react';
import { Page } from '../types';
import { getAllStories } from '../utils/storyLoader';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

interface ArchiveListProps {
    onNavigate: (page: Page) => void;
}

const ArchiveList: React.FC<ArchiveListProps> = ({ onNavigate }) => {
    const [clickCount, setClickCount] = React.useState(0);

    const handleArchiveTitleClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount >= 5) {
            onNavigate('admin');
            setClickCount(0);
        }
        // Reset count after 2 seconds of inactivity
        setTimeout(() => setClickCount(0), 2000);
    };

    return (
        <div className="min-h-screen flex relative bg-limestone/30">
            <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 border-r border-border-paper/40 items-center justify-center pointer-events-none z-10">
                <h1 className="writing-vertical text-7xl font-extrabold tracking-[0.3em] text-charcoal/5 uppercase select-none whitespace-nowrap">
                    Archive
                </h1>
            </aside>

            <main className="flex-1 md:ml-24 max-w-4xl pt-16 md:pt-24 pb-40 px-6 md:px-16">
                <header className="mb-16">
                    <div className="mb-16">
                        <Logo className="h-10 w-44 md:h-12 md:w-52" interactive variant="dark" />
                    </div>
                    <div className="md:hidden mb-8" onClick={handleArchiveTitleClick}>
                        <h1 className="text-4xl font-extrabold tracking-widest text-charcoal/10 uppercase">Archive</h1>
                    </div>
                    <p
                        className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted mb-4 cursor-default select-none"
                        onClick={handleArchiveTitleClick}
                    >
                        Cinematic Stories
                    </p>
                    <div className="h-[2px] w-16 bg-primary/40"></div>
                </header>

                <div className="flex flex-col space-y-4 md:space-y-[-10px]">
                    {getAllStories().map((story) => (
                        <article
                            key={story.id}
                            onClick={() => {
                                onNavigate(`story-${story.slug}`);
                            }}
                            className="group relative bg-paper border border-border-paper shadow-lifted hover:shadow-floating transition-all duration-300 transform hover:-translate-y-2 z-10 cursor-pointer"
                        >
                            <div className="flex items-center justify-between p-6 md:p-10 h-32 md:h-44">
                                <div className="flex flex-col flex-1">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-2">
                                        {story.location} • {story.date}
                                    </span>
                                    <h2
                                        className="text-2xl md:text-4xl font-extrabold tracking-tight text-charcoal group-hover:text-primary transition-colors"
                                    >
                                        {story.client}
                                    </h2>
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all mt-4 translate-y-2 group-hover:translate-y-0">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">View Gallery</span>
                                        <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                                    </div>
                                </div>
                                <div className="w-20 h-20 md:w-32 md:h-32 bg-limestone overflow-hidden border border-border-paper shrink-0 shadow-inner">
                                    <img
                                        src={story.thumbnailUrl}
                                        className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                                        alt={story.client}
                                    />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <footer className="mt-40 text-center">
                    <div className="flex items-center justify-center gap-4 text-muted/30">
                        <div className="h-px flex-1 bg-border-paper max-w-[50px]"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em]">Selected Archives</span>
                        <div className="h-px flex-1 bg-border-paper max-w-[50px]"></div>
                    </div>
                </footer>
            </main>

            <Navigation active="index" onNavigate={onNavigate} />
        </div>
    );
};

export default ArchiveList;
