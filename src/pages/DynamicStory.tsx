
import React, { useEffect, useState } from 'react';
import { Page, StoryData } from '../types';
import { getStoryBySlug } from '../utils/storyLoader';
import StoryLayout from '../components/StoryLayout';

interface Props {
    slug: string;
    onNavigate: (page: Page) => void;
}

const DynamicStory: React.FC<Props> = ({ slug, onNavigate }) => {
    const [story, setStory] = useState<StoryData | null>(null);

    useEffect(() => {
        getStoryBySlug(slug).then(data => {
            if (data) setStory(data);
        });
    }, [slug]);

    if (!story) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-limestone text-charcoal">
                <p className="font-bold uppercase tracking-widest animate-pulse">Loading Story...</p>
            </div>
        );
    }

    return <StoryLayout story={story} onNavigate={onNavigate} />;
};

export default DynamicStory;
