
import React, { useState, useEffect, useMemo } from 'react';
import { Page, StoryData, SiteConfig, Thought } from '../../types';
import { getAllStories } from '../../utils/storyLoader';
import { loadDescriptions, Description } from '../../services/descriptionService';

interface Props {
    onNavigate: (page: Page) => void;
}

type Tab = 'stories' | 'home-stills' | 'info';

const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('stories');
    const [stories, setStories] = useState<StoryData[]>([]);
    const [descriptions, setDescriptions] = useState<Record<string, Description>>({});
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [selectedStory, setSelectedStory] = useState<string | null>(null);
    const [storyImages, setStoryImages] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Story Creation State
    const [newStory, setNewStory] = useState({ client: '', location: '', date: '', slug: '' });
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Image Picker State
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [allImages, setAllImages] = useState<{ url: string; story: string }[]>([]);
    const [pickerTarget, setPickerTarget] = useState<{ type: 'home' | 'stills'; index: number } | null>(null);
    const [pickerSearch, setPickerSearch] = useState('');
    const [displayLimit, setDisplayLimit] = useState(48);

    useEffect(() => {
        if (!sessionStorage.getItem('isAdmin')) {
            onNavigate('admin');
            return;
        }

        const tryFetch = async (url: string) => {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setConfig(data);
                return true;
            } catch (e) {
                console.warn(`Failed to fetch from ${url}:`, e);
                return false;
            }
        };

        const loadConfig = async () => {
            const baseUrl = import.meta.env.BASE_URL || '/';
            // Try relative first (should work on dev and most prod setups)
            if (await tryFetch('data/site-config.json')) return;
            // Try absolute with base URL if relative fails
            if (baseUrl !== '/' && await tryFetch(`${baseUrl}data/site-config.json`)) return;

            setMessage('Error: Failed to load site-config.json');
        };

        setStories(getAllStories());
        loadDescriptions().then(setDescriptions);
        loadConfig();

        // Index images for the picker once on mount
        const indexImages = () => {
            const images: { url: string; story: string }[] = [];
            const storyImagesGlob = import.meta.glob('/public/images/stories/*/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' });

            Object.entries(storyImagesGlob).forEach(([path, url]) => {
                const storySlug = path.split('/')[4];
                images.push({
                    url: (url as string).replace(import.meta.env.BASE_URL, ''),
                    story: storySlug
                });
            });
            setAllImages(images);
        };
        indexImages();
    }, [onNavigate]);

    useEffect(() => {
        if (selectedStory && activeTab === 'stories') {
            const story = stories.find(s => s.id === selectedStory);
            if (story) {
                const allStoryImages = import.meta.glob('/public/images/stories/*/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' });
                const currentImages = Object.keys(allStoryImages).filter(path =>
                    path.includes(`/stories/${story.slug}/`) &&
                    !path.includes('hero.') &&
                    !path.includes('thumbnail.') &&
                    !path.includes('/carousel/')
                ).map(path => allStoryImages[path] as string);

                setStoryImages(currentImages);
            }
        }
    }, [selectedStory, stories, activeTab]);

    const handleSave = async (data: any, endpoint: string) => {
        setIsSaving(true);
        setMessage('');
        try {
            const response = await fetch(`http://localhost:3001/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                setMessage('Changes saved successfully!');
            } else {
                setMessage('Failed to save changes.');
            }
        } catch (error) {
            console.error(error);
            setMessage('Server connection error.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateStory = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:3001/api/create-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStory)
            });
            if (res.ok) {
                setMessage('Story created! Refreshing...');
                window.location.reload();
            } else {
                setMessage('Error creating story.');
            }
        } catch (err) {
            setMessage('Failed to connect to server.');
        } finally {
            setIsSaving(false);
        }
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        const newImages = [...storyImages];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < newImages.length) {
            [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
            setStoryImages(newImages);
        }
    };

    const handleOpenImagePicker = (type: 'home' | 'stills', index: number) => {
        setPickerTarget({ type, index });
        setDisplayLimit(48); // Reset limit when opening
        setShowImagePicker(true);
    };

    const filteredImages = useMemo(() => {
        const search = pickerSearch.toLowerCase();
        return allImages.filter(img =>
            img.story.toLowerCase().includes(search) ||
            img.url.toLowerCase().includes(search)
        );
    }, [allImages, pickerSearch]);

    const handleSelectImage = (url: string) => {
        if (!pickerTarget || !config) return;

        const updatedConfig = { ...config };
        const cleanedUrl = url.startsWith('/') ? url.substring(1) : url;

        if (pickerTarget.type === 'home') {
            updatedConfig.home.items[pickerTarget.index].imageUrl = cleanedUrl;
        } else {
            updatedConfig.stills.items[pickerTarget.index].imageUrl = cleanedUrl;
        }

        setConfig(updatedConfig);
        setShowImagePicker(false);
        setPickerTarget(null);
    };

    const resolveUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.BASE_URL || '/';
        const cleanPath = url.startsWith('/') ? url.substring(1) : url;
        return `${baseUrl}${cleanPath}`;
    };

    return (
        <div className="min-h-screen bg-limestone text-charcoal p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Studio Admin</h1>
                        <p className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase mt-2">v2.0 • Local Systems</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {message && <span className={`text-[10px] font-bold uppercase tracking-widest ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{message}</span>}
                        <button
                            onClick={async () => {
                                setIsSaving(true);
                                setMessage('Deploying to production...');
                                try {
                                    const res = await fetch('http://localhost:3001/api/deploy', { method: 'POST' });
                                    if (res.ok) setMessage('Deployed successfully!');
                                    else setMessage('Deploy failed.');
                                } catch (err) {
                                    setMessage('Deploy server error.');
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            disabled={isSaving}
                            className="px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 shadow-lifted"
                        >
                            Deploy to Live
                        </button>
                        <button onClick={() => onNavigate('home')} className="px-6 py-3 border border-charcoal text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all">Exit</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-charcoal/10 mb-8 overflow-x-auto no-scrollbar">
                    {(['stories', 'home-stills', 'info'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'border-b-2 border-primary text-charcoal' : 'text-muted hover:text-charcoal'}`}
                        >
                            {tab.replace('-', ' & ')}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Sidebar Area */}
                    <div className="md:col-span-1 space-y-8">
                        {activeTab === 'stories' && (
                            <>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="w-full py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lifted"
                                >
                                    + Create New Story
                                </button>
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4 border-b pb-2">Select Story</h3>
                                    {stories.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedStory(s.id)}
                                            className={`w-full text-left p-4 text-xs font-bold border transition-all ${selectedStory === s.id ? 'bg-charcoal text-white border-charcoal' : 'bg-white border-stone-200 hover:border-charcoal'}`}
                                        >
                                            {s.client}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        {activeTab === 'home-stills' && (
                            <div className="space-y-4">
                                <div className="p-6 bg-white border border-stone-200">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Quick Stats</h3>
                                    {config ? (
                                        <>
                                            <p className="text-2xl font-black">{config.home.items.length} Home Items</p>
                                            <p className="text-2xl font-black mt-2">{config.stills.items.length} Still Items</p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-muted animate-pulse">Loading data...</p>
                                    )}
                                </div>
                                <div className="p-4 bg-stone-50 border border-stone-200 border-dashed">
                                    <h3 className="text-[8px] font-bold uppercase tracking-widest text-muted mb-2">System Diagnostics</h3>
                                    <p className="text-[9px] font-mono text-muted overflow-hidden text-ellipsis">Base: {import.meta.env.BASE_URL || '/'}</p>
                                    <p className="text-[9px] font-mono text-muted">Config: {config ? 'Loaded' : 'Missing'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Editing Area */}
                    <div className="md:col-span-3">
                        {activeTab === 'stories' && selectedStory && (
                            <div className="space-y-12">
                                <div className="flex justify-between items-end border-b border-charcoal/10 pb-4">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Managing: {stories.find(s => s.id === selectedStory)?.client}</h2>
                                    <button
                                        onClick={() => handleSave(descriptions, 'save-descriptions')}
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 disabled:opacity-50"
                                    >
                                        Save All Changes
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    {storyImages.map((img, idx) => (
                                        <div
                                            key={img}
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData('text/plain', idx.toString())}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                                const toIndex = idx;
                                                const newImages = [...storyImages];
                                                const [moved] = newImages.splice(fromIndex, 1);
                                                newImages.splice(toIndex, 0, moved);
                                                setStoryImages(newImages);
                                            }}
                                            className="bg-white p-6 border border-stone-200 flex gap-6 group hover:border-primary/30 transition-all shadow-sm cursor-move active:scale-[0.98]"
                                        >
                                            <div className="w-40 h-40 bg-limestone overflow-hidden border border-stone-100 relative shrink-0">
                                                <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Story" />
                                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">#{idx + 1}</span>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1 flex-1 mr-4">
                                                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted">Description Text</label>
                                                        <textarea
                                                            value={descriptions[img]?.text || ''}
                                                            onChange={(e) => setDescriptions(prev => ({ ...prev, [img]: { ...prev[img], text: e.target.value } }))}
                                                            className="w-full p-3 border border-stone-200 text-xs font-medium focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
                                                            placeholder="Enter caption..."
                                                        />
                                                    </div>
                                                    <div className="space-y-4 shrink-0">
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    const story = stories.find(s => s.id === selectedStory);
                                                                    if (!story) return;
                                                                    try {
                                                                        const res = await fetch('http://localhost:3001/api/toggle-carousel', {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({
                                                                                slug: story.slug,
                                                                                imagePath: img.replace(import.meta.env.BASE_URL, '/public/'),
                                                                                isCarousel: !img.includes('/carousel/')
                                                                            })
                                                                        });
                                                                        if (res.ok) {
                                                                            setMessage('Image moved! Reloading...');
                                                                            setTimeout(() => window.location.reload(), 1000);
                                                                        }
                                                                    } catch (err) {
                                                                        setMessage('Failed to toggle carousel.');
                                                                    }
                                                                }}
                                                                className={`px-4 py-2 text-[8px] font-bold uppercase tracking-widest border border-charcoal transition-all ${img.includes('/carousel/') ? 'bg-charcoal text-white' : 'hover:bg-charcoal hover:text-white'}`}
                                                            >
                                                                {img.includes('/carousel/') ? 'In Carousel' : 'Add to Carousel'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold uppercase tracking-widest text-muted">Instagram Link (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={descriptions[img]?.instagramUrl || ''}
                                                        onChange={(e) => setDescriptions(prev => ({ ...prev, [img]: { ...prev[img], instagramUrl: e.target.value } }))}
                                                        className="w-full p-2 border border-stone-200 text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                                                        placeholder="https://instagram.com/p/..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'home-stills' && !config && (
                            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-stone-100 rounded-lg">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                                <h2 className="text-lg font-bold uppercase tracking-widest text-charcoal">Loading Selections...</h2>
                                <p className="text-xs text-muted mt-2">Connecting to data warehouse</p>
                            </div>
                        )}

                        {activeTab === 'home-stills' && config && (
                            <div className="space-y-12">
                                <div className="flex justify-between items-end border-b border-charcoal/10 pb-4">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Main Site Content</h2>
                                    <button onClick={() => handleSave(config, 'save-config')} className="px-8 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lifted">Save Config</button>
                                </div>

                                <div className="space-y-16">
                                    {/* Home Page Editor */}
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">1</span>
                                            <h3 className="text-sm font-bold uppercase tracking-widest">Home Page (Selections)</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white border border-stone-200 shadow-sm">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase text-muted">Hero Title</label>
                                                <input type="text" value={config.home.title} onChange={(e) => setConfig({ ...config, home: { ...config.home, title: e.target.value } })} className="w-full p-4 bg-limestone border-none text-sm font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase text-muted">Hero Subtitle</label>
                                                <input type="text" value={config.home.subtitle} onChange={(e) => setConfig({ ...config, home: { ...config.home, subtitle: e.target.value } })} className="w-full p-4 bg-limestone border-none text-sm font-bold" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase text-muted tracking-widest">Grid Portfolio Items</label>
                                            <div className="grid grid-cols-1 gap-4">
                                                {config.home.items.map((item, i) => (
                                                    <div key={i} className="bg-white p-6 border border-stone-200 grid grid-cols-1 md:grid-cols-7 gap-6 items-end group">
                                                        <div className="md:col-span-1">
                                                            <div className="aspect-[3/4] bg-stone-100 border border-stone-100 overflow-hidden">
                                                                <img src={resolveUrl(item.imageUrl)} className="w-full h-full object-cover" alt="" onError={(e) => (e.currentTarget.src = 'https://placehold.co/300x400?text=Missing')} />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-[8px] font-bold uppercase text-muted">Project Title</label>
                                                            <input value={item.title} onChange={(e) => {
                                                                const items = [...config.home.items];
                                                                items[i] = { ...items[i], title: e.target.value };
                                                                setConfig({ ...config, home: { ...config.home, items } });
                                                            }} className="w-full p-2 border-stone-100 border text-xs font-bold" />
                                                        </div>
                                                        <div className="md:col-span-1 space-y-2">
                                                            <label className="text-[8px] font-bold uppercase text-muted">Category</label>
                                                            <input value={item.category} onChange={(e) => {
                                                                const items = [...config.home.items];
                                                                items[i] = { ...items[i], category: e.target.value };
                                                                setConfig({ ...config, home: { ...config.home, items } });
                                                            }} className="w-full p-2 border-stone-100 border text-xs" />
                                                        </div>
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-[8px] font-bold uppercase text-muted">Image Path</label>
                                                            <div className="flex gap-2">
                                                                <input value={item.imageUrl} onChange={(e) => {
                                                                    const items = [...config.home.items];
                                                                    items[i] = { ...items[i], imageUrl: e.target.value };
                                                                    setConfig({ ...config, home: { ...config.home, items } });
                                                                }} className="flex-1 p-2 border-stone-100 border text-xs font-mono" />
                                                                <button
                                                                    onClick={() => handleOpenImagePicker('home', i)}
                                                                    className="px-3 bg-stone-100 border border-stone-200 text-[8px] font-black uppercase hover:bg-stone-200"
                                                                >
                                                                    Pick
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-1">
                                                            <button onClick={() => {
                                                                const items = config.home.items.filter((_, idx) => idx !== i);
                                                                setConfig({ ...config, home: { ...config.home, items } });
                                                            }} className="w-full py-2 text-red-500 text-[10px] font-bold uppercase hover:bg-red-50">Delete</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => {
                                                    const newItem = { id: Date.now().toString(), title: 'New Project', category: 'Portrait', imageUrl: 'images/placeholder.webp', date: '2024' };
                                                    setConfig({ ...config, home: { ...config.home, items: [...config.home.items, newItem] } });
                                                }} className="w-full py-4 border-2 border-dashed border-stone-200 text-[10px] font-bold uppercase tracking-widest text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">+ Add Selection</button>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Stills Page Editor */}
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">2</span>
                                            <h3 className="text-sm font-bold uppercase tracking-widest">Stills Collection</h3>
                                        </div>
                                        <div className="space-y-6 p-6 bg-white border border-stone-200 shadow-sm">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase text-muted">Page Headline</label>
                                                <input type="text" value={config.stills.title} onChange={(e) => setConfig({ ...config, stills: { ...config.stills, title: e.target.value } })} className="w-full p-4 bg-limestone border-none text-sm font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase text-muted">Narrative Description</label>
                                                <textarea value={config.stills.description} onChange={(e) => setConfig({ ...config, stills: { ...config.stills, description: e.target.value } })} className="w-full p-4 bg-limestone border-none text-sm min-h-[100px]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase text-muted tracking-widest">Stills Grid</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {config.stills.items.map((item, i) => (
                                                    <div key={i} className="bg-white p-4 border border-stone-200 flex gap-4">
                                                        <div className="w-20 aspect-square bg-stone-100 overflow-hidden shrink-0">
                                                            <img src={resolveUrl(item.imageUrl)} className="w-full h-full object-cover" alt="" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=Err')} />
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex justify-between">
                                                                <input value={item.title} onChange={(e) => {
                                                                    const items = [...config.stills.items];
                                                                    items[i] = { ...items[i], title: e.target.value };
                                                                    setConfig({ ...config, stills: { ...config.stills, items } });
                                                                }} className="p-1 border-b border-stone-100 text-xs font-bold w-full" placeholder="Title" />
                                                                <button onClick={() => {
                                                                    const items = config.stills.items.filter((_, idx) => idx !== i);
                                                                    setConfig({ ...config, stills: { ...config.stills, items } });
                                                                }} className="text-red-500 hover:text-red-700 ml-2">×</button>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input value={item.imageUrl} onChange={(e) => {
                                                                    const items = [...config.stills.items];
                                                                    items[i] = { ...items[i], imageUrl: e.target.value };
                                                                    setConfig({ ...config, stills: { ...config.stills, items } });
                                                                }} className="flex-1 p-1 text-[10px] font-mono text-muted" placeholder="Path..." />
                                                                <button
                                                                    onClick={() => handleOpenImagePicker('stills', i)}
                                                                    className="px-2 bg-stone-100 border border-stone-200 text-[8px] font-black uppercase hover:bg-stone-200"
                                                                >
                                                                    Pick
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => {
                                                    const newItem = { id: 's' + Date.now(), title: 'New Still', category: 'Portraits', imageUrl: 'images/placeholder.webp', subtitle: '00' };
                                                    setConfig({ ...config, stills: { ...config.stills, items: [...config.stills.items, newItem] } });
                                                }} className="flex items-center justify-center border-2 border-dashed border-stone-200 text-[10px] font-bold uppercase hover:border-primary hover:text-primary transition-all p-8">+ Add Still</button>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'info' && config && (
                            <div className="space-y-12">
                                <div className="flex justify-between items-end border-b border-charcoal/10 pb-4">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Identity & Contacts</h2>
                                    <button onClick={() => handleSave(config, 'save-config')} className="px-8 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lifted">Save Info</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Displayed name</label>
                                            <input type="text" value={config.info.name} onChange={(e) => setConfig({ ...config, info: { ...config.info, name: e.target.value } })} className="w-full p-4 bg-white border border-stone-200 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Role/Title</label>
                                            <input type="text" value={config.info.role} onChange={(e) => setConfig({ ...config, info: { ...config.info, role: e.target.value } })} className="w-full p-4 bg-white border border-stone-200 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Primary Quote</label>
                                            <textarea value={config.info.quote} onChange={(e) => setConfig({ ...config, info: { ...config.info, quote: e.target.value } })} className="w-full p-4 bg-white border border-stone-200 text-sm italic font-serif min-h-[120px]" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Biography Text</label>
                                            <textarea value={config.info.bio} onChange={(e) => setConfig({ ...config, info: { ...config.info, bio: e.target.value } })} className="w-full p-4 bg-white border border-stone-200 text-sm leading-relaxed min-h-[150px]" />
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Contact Matrix</label>
                                            <div className="grid grid-cols-1 gap-4 bg-stone-50 p-6 border border-stone-200">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold uppercase text-muted">Email</label>
                                                    <input type="text" value={config.info.contact.email} onChange={(e) => setConfig({ ...config, info: { ...config.info, contact: { ...config.info.contact, email: e.target.value } } })} className="w-full p-2 border text-xs" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold uppercase text-muted">Instagram Handle</label>
                                                    <input type="text" value={config.info.contact.instagram} onChange={(e) => setConfig({ ...config, info: { ...config.info, contact: { ...config.info.contact, instagram: e.target.value } } })} className="w-full p-2 border text-xs" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold uppercase text-muted">Base Location</label>
                                                    <input type="text" value={config.info.contact.location} onChange={(e) => setConfig({ ...config, info: { ...config.info, contact: { ...config.info.contact, location: e.target.value } } })} className="w-full p-2 border text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Creative Thoughts</label>
                                            <div className="space-y-2 border border-stone-200 p-4 bg-stone-50 h-[300px] overflow-y-auto no-scrollbar">
                                                {config.info.creative_thoughts.map((t, i) => (
                                                    <div key={i} className={`flex gap-4 ${t.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                        {t.role !== 'admin' && <button onClick={() => {
                                                            const newThoughts = config.info.creative_thoughts.filter((_, idx) => idx !== i);
                                                            setConfig({ ...config, info: { ...config.info, creative_thoughts: newThoughts } });
                                                        }} className="text-[8px] text-red-400 self-center">Del</button>}
                                                        <div className={`max-w-[80%] p-3 text-[10px] font-bold uppercase tracking-tight ${t.role === 'admin' ? 'bg-charcoal text-white' : 'bg-white border'}`}>
                                                            {t.text}
                                                        </div>
                                                        {t.role === 'admin' && <button onClick={() => {
                                                            const newThoughts = config.info.creative_thoughts.filter((_, idx) => idx !== i);
                                                            setConfig({ ...config, info: { ...config.info, creative_thoughts: newThoughts } });
                                                        }} className="text-[8px] text-red-400 self-center">Del</button>}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <input
                                                    type="text"
                                                    id="newThought"
                                                    placeholder="Role-playing thought..."
                                                    className="flex-1 p-4 border border-stone-200 text-xs bg-white border-t-2 border-t-primary"
                                                />
                                                <button onClick={() => {
                                                    const input = document.getElementById('newThought') as HTMLInputElement;
                                                    if (input.value) {
                                                        const newThoughts: Thought[] = [...config.info.creative_thoughts, { role: 'user', text: input.value }];
                                                        setConfig({ ...config, info: { ...config.info, creative_thoughts: newThoughts } });
                                                        input.value = '';
                                                    }
                                                }} className="px-6 bg-charcoal text-white text-[10px] font-bold uppercase">Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Create Story Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white max-w-lg w-full p-10 border-t-8 border-primary relative">
                        <button onClick={() => setShowCreateForm(false)} className="absolute top-4 right-4 text-2xl font-light hover:text-primary">×</button>
                        <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">New Story</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-8">Scaffold fresh collection</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted">Client Name</label>
                                    <input type="text" onChange={(e) => setNewStory({ ...newStory, client: e.target.value })} className="w-full p-3 border border-stone-300 text-sm font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted">Slug (url unique)</label>
                                    <input type="text" onChange={(e) => setNewStory({ ...newStory, slug: e.target.value })} className="w-full p-3 border border-stone-300 text-xs font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted">Location</label>
                                    <input type="text" onChange={(e) => setNewStory({ ...newStory, location: e.target.value })} className="w-full p-3 border border-stone-300 text-sm font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted">Year</label>
                                    <input type="text" onChange={(e) => setNewStory({ ...newStory, date: e.target.value })} className="w-full p-3 border border-stone-300 text-sm font-bold" />
                                </div>
                            </div>
                            <button onClick={handleCreateStory} disabled={isSaving} className="w-full py-5 bg-charcoal text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-stone-800 transition-all shadow-lifted">Initialize Collection</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Picker Modal */}
            {showImagePicker && (
                <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-md">
                    <div className="bg-white w-full max-w-5xl h-[80vh] flex flex-col border-t-8 border-primary relative">
                        <button onClick={() => setShowImagePicker(false)} className="absolute top-4 right-4 text-2xl font-light hover:text-primary z-10">×</button>

                        <div className="p-8 border-b border-stone-100">
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Select Asset</h2>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Search stories..."
                                    value={pickerSearch}
                                    onChange={(e) => setPickerSearch(e.target.value)}
                                    className="flex-1 p-3 bg-stone-50 border border-stone-200 text-xs font-bold uppercase tracking-widest"
                                />
                                <div className="px-4 py-3 bg-stone-100 text-[10px] font-bold text-muted uppercase flex items-center">
                                    {allImages.length} Assets Found
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                                {filteredImages.slice(0, displayLimit).map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectImage(img.url)}
                                        className="group relative aspect-square bg-stone-100 border border-stone-200 hover:border-primary transition-all overflow-hidden"
                                    >
                                        <img
                                            src={resolveUrl(img.url)}
                                            loading="lazy"
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform group-hover:scale-110"
                                            alt=""
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                            <p className="text-[8px] font-bold text-white uppercase truncate">{img.story}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {displayLimit < filteredImages.length && (
                                <div className="flex justify-center pb-12">
                                    <button
                                        onClick={() => setDisplayLimit(prev => prev + 48)}
                                        className="px-12 py-4 bg-charcoal text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lifted"
                                    >
                                        Load More Results ({filteredImages.length - displayLimit} Remaining)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
