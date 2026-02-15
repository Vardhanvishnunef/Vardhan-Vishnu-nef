
import { StoryData } from '../types';

// Define the shape of the metadata.json
// heroImage and thumbnailUrl are now optional in JSON as they will be auto-detected
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

/**
 * Dynamically loads all story metadata from /public/images/stories/[slug]/metadata.json
 * Uses Vite's import.meta.glob feature.
 */
export const getAllStories = (): StoryData[] => {
    // 1. Load all metadata.json files
    const metadataModules = import.meta.glob<StoryMetadata>('/public/images/stories/*/metadata.json', {
        eager: true,
        import: 'default'
    });

    // 2. Load all potential image files (hero.* and thumbnail.*)
    // We scan for common image formats
    const imageModules = import.meta.glob('/public/images/stories/*/*.{png,jpg,jpeg,webp,avif}', {
        eager: true,
        as: 'url'
    });

    const stories: StoryData[] = Object.keys(metadataModules).map((path) => {
        const metadata = metadataModules[path];

        // path example: /public/images/stories/divya/metadata.json
        // folderSlug: divya
        const folderSlug = path.split('/').slice(-2)[0];
        const slug = metadata.slug || folderSlug;
        const storyFolderPath = `/public/images/stories/${folderSlug}`;

        // Auto-detect hero image if not provided
        let heroImage = metadata.heroImage;
        if (!heroImage) {
            // value is the resolved URL path (e.g., /src/assets/...) or public path
            // keys in imageModules are like /public/images/stories/divya/hero.webp
            const heroKey = Object.keys(imageModules).find(key =>
                key.startsWith(`${storyFolderPath}/hero.`)
            );
            heroImage = heroKey ? imageModules[heroKey].replace(/^\/public\//, '') : '';
        }

        // Auto-detect thumbnail if not provided
        let thumbnailUrl = metadata.thumbnailUrl;
        if (!thumbnailUrl) {
            const thumbKey = Object.keys(imageModules).find(key =>
                key.startsWith(`${storyFolderPath}/thumbnail.`)
            );
            thumbnailUrl = thumbKey ? imageModules[thumbKey].replace(/^\/public\//, '') : '';
        }

        return {
            ...metadata,
            slug,
            heroImage: heroImage || '', // Fallback to empty string if not found
            thumbnailUrl: thumbnailUrl || ''
        };
    });

    // Sort by ID (descending to show newest first, assuming higher ID = newer) or by Date
    // For now keeping existing ID sort logic
    return stories.sort((a, b) => parseInt(a.id) - parseInt(b.id));
};

export const getStoryBySlug = (slug: string): StoryData | undefined => {
    const stories = getAllStories();
    return stories.find(s => s.slug === slug);
};
