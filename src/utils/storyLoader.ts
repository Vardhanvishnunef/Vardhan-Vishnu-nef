import { StoryData } from '../types';
import { resolvePublicUrl } from './resolveUrl';

interface StoryMetadata {
    id: string;
    client: string;
    location: string;
    date: string;
    heroImage?: string;
    thumbnailUrl?: string;
    description: string;
    slug: string;
}

// Glob for metadata URLs (public assets served at root — get URL, then fetch)
const metadataUrls = import.meta.glob('/public/images/stories/*/metadata.json', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

// Glob for image file paths (keys used for lookup, not as URLs)
const imageModules = import.meta.glob('/public/images/stories/*/*.webp', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

let cachedStories: StoryData[] | null = null;

export const getAllStories = async (): Promise<StoryData[]> => {
    if (cachedStories) return cachedStories;

    const entries = await Promise.all(
        Object.entries(metadataUrls).map(async ([filePath, url]) => {
            try {
                const res = await fetch(url as string);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const metadata: StoryMetadata = await res.json();

                const folderSlug = filePath.split('/').slice(-2)[0];
                const slug = metadata.slug || folderSlug;
                const storyFolderPath = `/public/images/stories/${folderSlug}`;

                let heroImage = metadata.heroImage;
                if (!heroImage) {
                    const heroKey = Object.keys(imageModules).find(key =>
                        key.startsWith(`${storyFolderPath}/hero.`)
                    );
                    heroImage = heroKey ? resolvePublicUrl(heroKey) : '';
                } else if (heroImage.includes('images/stories')) {
                    heroImage = resolvePublicUrl(heroImage);
                }

                let thumbnailUrl = metadata.thumbnailUrl;
                if (!thumbnailUrl) {
                    const thumbKey = Object.keys(imageModules).find(key =>
                        key.startsWith(`${storyFolderPath}/thumbnail.`)
                    );
                    thumbnailUrl = thumbKey ? resolvePublicUrl(thumbKey) : '';
                } else if (thumbnailUrl.includes('images/stories')) {
                    thumbnailUrl = resolvePublicUrl(thumbnailUrl);
                }

                return { ...metadata, slug, heroImage: heroImage || '', thumbnailUrl: thumbnailUrl || '' } as StoryData;
            } catch (e) {
                console.warn(`Failed to load metadata for ${filePath}:`, e);
                return null;
            }
        })
    );

    cachedStories = entries
        .filter((s): s is StoryData => s !== null)
        .sort((a, b) => parseInt(a.id) - parseInt(b.id));

    return cachedStories;
};

export const getStoryBySlug = async (slug: string): Promise<StoryData | undefined> => {
    const stories = await getAllStories();
    return stories.find(s => s.slug === slug);
};
