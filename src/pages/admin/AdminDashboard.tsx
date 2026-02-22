
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
    const [githubToken, setGithubToken] = useState<string>(localStorage.getItem('gh_token') || import.meta.env.VITE_GITHUB_TOKEN || '');
    const [deployLog, setDeployLog] = useState('');

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
                return await res.json();
            } catch (e) {
                console.warn(`Failed to fetch from ${url}:`, e);
                return null;
            }
        };

        const loadConfig = async () => {
            const baseUrl = import.meta.env.BASE_URL || '/';
            let data = await tryFetch('data/site-config.json');
            if (!data && baseUrl !== '/') {
                data = await tryFetch(`${baseUrl}data/site-config.json`);
            }
            if (data) setConfig(data);
            else setMessage('Error: Failed to load site-config.json');
        };

        setStories(getAllStories());
        loadDescriptions().then(setDescriptions);
        loadConfig();

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

    // GitHub API Helpers
    const REPO_OWNER = 'manojkakitha';
    const REPO_NAME = 'Vardhan-Vishnu';

    const githubRequest = async (path: string, method: string = 'GET', body: any = null) => {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
        const headers: Record<string, string> = {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
        };

        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || `GitHub API error: ${res.status}`);
        }

        return res.json();
    };

    const updateFileOnGithub = async (filePath: string, content: any, commitMessage: string) => {
        let sha: string | undefined;
        try {
            const fileInfo = await githubRequest(filePath);
            sha = fileInfo.sha;
        } catch (e) {
            console.log("File might be new, proceeding without SHA");
        }

        const stringified = typeof content === 'string' ? content : JSON.stringify(content, null, 4);
        const encodedContent = btoa(unescape(encodeURIComponent(stringified)));

        return githubRequest(filePath, 'PUT', {
            message: commitMessage,
            content: encodedContent,
            sha
        });
    };

    const moveFileOnGithub = async (sourcePath: string, targetPath: string, commitMessage: string) => {
        const sourceFile = await githubRequest(sourcePath);
        await githubRequest(targetPath, 'PUT', {
            message: commitMessage,
            content: sourceFile.content,
        });
        return githubRequest(sourcePath, 'DELETE', {
            message: `Cleanup after move: ${commitMessage}`,
            sha: sourceFile.sha
        });
    };

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
        if (!githubToken) {
            setMessage('Error: GitHub Token required for saving.');
            return;
        }
        setIsSaving(true);
        setMessage('Saving to GitHub...');
        try {
            const fileName = endpoint === 'save-config' ? 'public/data/site-config.json' : 'public/data/descriptions.json';
            await updateFileOnGithub(fileName, data, `Admin Update: ${endpoint}`);
            setMessage('Changes saved to GitHub! Deployment started.');
        } catch (error: any) {
            console.error(error);
            setMessage(`GitHub Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateStory = async () => {
        if (!githubToken) {
            setMessage('Error: GitHub Token required.');
            return;
        }
        setIsSaving(true);
        setMessage('Creating story on GitHub...');
        try {
            const metadata = {
                id: `story-${Date.now()}`,
                client: newStory.client,
                location: newStory.location,
                date: newStory.date,
                description: `A new cinematic story from ${newStory.location}`,
                slug: newStory.slug,
                thumbnailUrl: `images/stories/${newStory.slug}/thumbnail.webp`,
                heroUrl: `images/stories/${newStory.slug}/hero.webp`
            };

            const metadataPath = `public/images/stories/${newStory.slug}/metadata.json`;
            await updateFileOnGithub(metadataPath, metadata, `Admin: Create story ${newStory.slug}`);

            setMessage('Story created! It will appear after deployment.');
            setShowCreateForm(false);
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
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
        setDisplayLimit(48);
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
                        <p className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase mt-2">v2.0 • Git Active</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-4">
                            <label className="text-[8px] font-bold uppercase text-muted mb-1">GitHub Token (PAT)</label>
                            <input
                                type="password"
                                value={githubToken}
                                onChange={(e) => {
                                    setGithubToken(e.target.value);
                                    localStorage.setItem('gh_token', e.target.value);
                                }}
                                className="p-2 border border-stone-200 text-[10px] w-40 bg-white"
                                placeholder="Paste token here..."
                            />
                        </div>
                        {message && <span className={`text-[10px] font-bold uppercase tracking-widest ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{message}</span>}
                        <button onClick={() => onNavigate('home')} className="px-6 py-3 border border-charcoal text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all">Exit Dashboard</button>
                    </div>
                </div>

                {!githubToken && (
                    <div className="mb-8 p-6 bg-yellow-50 border border-yellow-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-400/20 text-yellow-600 flex items-center justify-center text-xl font-bold">!</div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-700">GitHub Authentication Required</p>
                                <p className="text-[9px] font-medium text-yellow-600/80 mt-1 text-pretty max-w-sm">Please provide a GitHub Personal Access Token in the settings above to enable saving changes and automatic deployment.</p>
                            </div>
                        </div>
                        <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noreferrer" className="px-4 py-2 bg-yellow-600 text-white text-[9px] font-bold uppercase hover:bg-yellow-700 transition-all">Generate Token</a>
                    </div>
                )}

                {deployLog && (
                    <div className="mb-8 p-4 bg-stone-900 border border-stone-800">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[8px] font-mono text-stone-500 uppercase">Error Details</p>
                            <button onClick={() => setDeployLog('')} className="text-[8px] text-white hover:text-primary uppercase font-bold">Close</button>
                        </div>
                        <pre className="text-[9px] font-mono text-red-400 whitespace-pre-wrap">{deployLog}</pre>
                    </div>
                )}

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
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted border-b pb-2">Section Editor</p>
                                <div className="bg-white p-4 border border-stone-200">
                                    <p className="text-[10px] font-bold uppercase">Quick Tips</p>
                                    <p className="text-[9px] mt-2 text-muted leading-relaxed">Changes made here update the homepage layout. Use the 'Save Changes' button below to sync with GitHub.</p>
                                </div>
                                <button
                                    onClick={() => handleSave(config, 'save-config')}
                                    disabled={isSaving || !githubToken}
                                    className="w-full py-4 bg-charcoal text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 disabled:opacity-50 shadow-lifted transition-all"
                                >
                                    Save Homepage Layout
                                </button>
                            </div>
                        )}
                        {activeTab === 'info' && (
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted border-b pb-2">Information Editor</p>
                                <button
                                    onClick={() => handleSave(descriptions, 'save-descriptions')}
                                    disabled={isSaving || !githubToken}
                                    className="w-full py-4 bg-charcoal text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 disabled:opacity-50 shadow-lifted transition-all"
                                >
                                    Save All Descriptions
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-3">
                        {activeTab === 'stories' && (
                            <div className="space-y-8">
                                {selectedStory ? (
                                    <>
                                        <div className="flex justify-between items-center bg-white p-6 border border-stone-200">
                                            <div>
                                                <h3 className="text-xl font-black uppercase tracking-tight">{stories.find(s => s.id === selectedStory)?.client}</h3>
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{stories.find(s => s.id === selectedStory)?.slug}</p>
                                            </div>
                                            <button
                                                onClick={() => handleSave(descriptions, 'save-descriptions')}
                                                disabled={isSaving || !githubToken}
                                                className="px-8 py-3 bg-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 disabled:opacity-50"
                                            >
                                                Save Settings
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {storyImages.map((img, idx) => (
                                                <div
                                                    key={img}
                                                    className="bg-white p-6 border border-stone-200 flex gap-6 group hover:border-primary/30 transition-all shadow-sm"
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
                                                                            if (!story || !githubToken) return;
                                                                            setIsSaving(true);
                                                                            setMessage('Moving file on GitHub...');
                                                                            try {
                                                                                const fileName = img.split('/').pop() || '';
                                                                                const isCurrentlyCarousel = img.includes('/carousel/');
                                                                                const sourcePath = `public/images/stories/${story.slug}/${isCurrentlyCarousel ? 'carousel/' : ''}${fileName}`;
                                                                                const targetPath = `public/images/stories/${story.slug}/${isCurrentlyCarousel ? '' : 'carousel/'}${fileName}`;

                                                                                await moveFileOnGithub(sourcePath, targetPath, `Admin: Toggle carousel for ${fileName}`);
                                                                                setMessage('Image moved! Deployment started.');
                                                                                setTimeout(() => window.location.reload(), 2000);
                                                                            } catch (err: any) {
                                                                                setMessage(`Failed to move: ${err.message}`);
                                                                            } finally {
                                                                                setIsSaving(false);
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
                                    </>
                                ) : (
                                    <div className="bg-white border-2 border-dashed border-stone-200 rounded-lg p-20 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                                            <span className="text-2xl grayscale">📂</span>
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted">No Story Selected</h3>
                                        <p className="text-xs text-stone-400 mt-2">Pick a story from the list to begin editing its visual flow and metadata.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'home-stills' && config && (
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tight border-b pb-4">Home Carousel</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {config.home.items.map((item, i) => (
                                            <div key={i} className="group relative aspect-[4/5] bg-stone-100 border border-stone-200 overflow-hidden shadow-sm">
                                                <img src={resolveUrl(item.imageUrl)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => handleOpenImagePicker('home', i)} className="px-6 py-2 bg-white text-charcoal text-[10px] font-bold uppercase tracking-widest scale-90 group-hover:scale-100 transition-transform">Replace</button>
                                                </div>
                                                <div className="absolute top-2 left-2 bg-charcoal/80 text-white text-[8px] font-bold px-2 py-0.5">#{i + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tight border-b pb-4">Stills Grid</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {config.stills.items.map((item, i) => (
                                            <div key={i} className="group relative aspect-square bg-stone-100 border border-stone-200 overflow-hidden shadow-sm">
                                                <img src={resolveUrl(item.imageUrl)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => handleOpenImagePicker('stills', i)} className="px-4 py-2 bg-white text-charcoal text-[8px] font-bold uppercase tracking-widest scale-90 group-hover:scale-100 transition-transform">Change</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'info' && config && (
                            <div className="space-y-12">
                                <div className="bg-white p-10 border border-stone-200 space-y-8">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Main Thoughts</h3>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Core philosophy items</p>
                                    </div>
                                    <div className="space-y-6">
                                        {config.info.creative_thoughts?.map((thought: Thought, i: number) => (
                                            <div key={i} className="space-y-3 p-6 bg-limestone/50 border border-stone-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-muted uppercase">Thought #{i + 1}</span>
                                                    <button onClick={() => {
                                                        const updatedConfig = { ...config };
                                                        updatedConfig.info.creative_thoughts.splice(i, 1);
                                                        setConfig(updatedConfig);
                                                    }} className="text-red-500 text-[10px] font-black uppercase hover:underline">Remove</button>
                                                </div>
                                                <div className="space-y-4">
                                                    <textarea
                                                        value={thought.text}
                                                        onChange={(e) => {
                                                            const updatedConfig = { ...config };
                                                            updatedConfig.info.creative_thoughts[i].text = e.target.value;
                                                            setConfig(updatedConfig);
                                                        }}
                                                        className="w-full p-4 border border-stone-200 text-xs font-medium outline-none focus:ring-1 focus:ring-primary min-h-[120px]"
                                                        placeholder="Content"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t border-stone-100 flex justify-center">
                                            <button onClick={() => {
                                                const updatedConfig = { ...config };
                                                updatedConfig.info.creative_thoughts.push({ role: 'user', text: 'New content here...' });
                                                setConfig(updatedConfig);
                                            }} className="px-12 py-4 border-2 border-dashed border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-charcoal hover:text-charcoal transition-all">
                                                + Add Thought Item
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-10 border border-stone-200 space-y-8">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Technical Stack</h3>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Manage listed expertise</p>
                                    </div>
                                    <div className="space-y-4">
                                        {config.stack.sections.map((section, si) => (
                                            <div key={si} className="p-4 border border-stone-100 bg-stone-50">
                                                <h4 className="text-[10px] font-bold uppercase mb-4">{section.title}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {section.items.map((item, ii) => (
                                                        <div key={ii} className="px-3 py-1 bg-white border border-stone-200 text-[9px] font-bold uppercase flex items-center gap-2">
                                                            {item.name}
                                                            <button onClick={() => {
                                                                const updatedConfig = { ...config };
                                                                updatedConfig.stack.sections[si].items.splice(ii, 1);
                                                                setConfig(updatedConfig);
                                                            }} className="text-muted hover:text-red-500">×</button>
                                                        </div>
                                                    ))}
                                                    <input
                                                        type="text"
                                                        placeholder="Add item..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const input = e.currentTarget;
                                                                const val = input.value.trim();
                                                                if (val) {
                                                                    const updatedConfig = { ...config };
                                                                    updatedConfig.stack.sections[si].items.push({ name: val, details: '' });
                                                                    setConfig(updatedConfig);
                                                                    input.value = '';
                                                                }
                                                            }
                                                        }}
                                                        className="p-1 text-[9px] border-b border-stone-300 outline-none w-20 bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                        ))}
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
