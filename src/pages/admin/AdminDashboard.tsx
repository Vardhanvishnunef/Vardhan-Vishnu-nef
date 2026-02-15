
import React, { useState, useEffect } from 'react';
import { Page, StoryData } from '../../types';
import { getAllStories } from '../../utils/storyLoader';
import { loadDescriptions, DescriptionMap } from '../../services/descriptionService';

interface Props {
    onNavigate: (page: Page) => void;
}

const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
    const [stories, setStories] = useState<StoryData[]>([]);
    const [descriptions, setDescriptions] = useState<DescriptionMap>({});
    const [selectedStory, setSelectedStory] = useState<string | null>(null);
    const [storyImages, setStoryImages] = useState<string[]>([]);

    useEffect(() => {
        // Check auth
        if (!sessionStorage.getItem('isAdmin')) {
            onNavigate('admin');
            return;
        }

        setStories(getAllStories());
        loadDescriptions().then(setDescriptions);
    }, [onNavigate]);

    useEffect(() => {
        if (selectedStory) {
            const story = stories.find(s => s.id === selectedStory);
            if (story) {
                // Load images for the selected story (similar logic to StoryLayout)
                // This is a simplified fetch, might need to duplicate logic or expose it from StoryLayout
                // For now, let's just use the known structure if possible or rely on glob in a real app
                // Since we can't easily reuse the glob logic inside a component unless it's in a hook or utility we can call.
                // Let's reuse the glob logic by importing it!
                // Actually, import.meta.glob works anywhere.

                const allStoryImages = import.meta.glob('/public/images/stories/*/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' });
                const currentImages = Object.keys(allStoryImages).filter(path =>
                    path.includes(`/stories/${story.slug}/`) &&
                    !path.includes('hero.') &&
                    !path.includes('thumbnail.') &&
                    !path.includes('/carousel/')
                ).map(path => allStoryImages[path]);

                setStoryImages(currentImages);
            }
        }
    }, [selectedStory, stories]);

    const handleDescriptionChange = (url: string, text: string) => {
        setDescriptions(prev => ({
            ...prev,
            [url]: text
        }));
    };

    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(descriptions, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "descriptions.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="min-h-screen bg-limestone p-8 text-charcoal">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => onNavigate('home')}
                            className="px-4 py-2 border border-charcoal rounded hover:bg-charcoal hover:text-white transition-colors"
                        >
                            Back to Site
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Download Config
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-bold mb-4">Stories</h2>
                        <ul className="space-y-2">
                            {stories.map(story => (
                                <li
                                    key={story.id}
                                    onClick={() => setSelectedStory(story.id)}
                                    className={`cursor-pointer p-2 rounded ${selectedStory === story.id ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                >
                                    {story.client}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-3 bg-white p-4 rounded shadow">
                        <h2 className="font-bold mb-4">Edit Descriptions</h2>
                        {!selectedStory && <p className="text-gray-500">Select a story to edit descriptions.</p>}

                        {selectedStory && (
                            <div className="grid grid-cols-1 gap-6">
                                {storyImages.map((img, idx) => (
                                    <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4">
                                        <img src={img} alt="Story" className="w-32 h-32 object-cover rounded" />
                                        <div className="flex-1">
                                            <textarea
                                                value={descriptions[img] || ''}
                                                onChange={(e) => handleDescriptionChange(img, e.target.value)}
                                                className="w-full h-full p-2 border border-stone-300 rounded focus:ring-1 focus:ring-primary"
                                                placeholder="Enter description..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
