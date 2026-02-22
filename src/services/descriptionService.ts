
export interface DescriptionMap {
    [imageUrl: string]: string;
}

export interface Description {
    text: string;
    instagramUrl?: string;
}

export type DescriptionsMap = Record<string, Description | string>;

export const loadDescriptions = async (): Promise<Record<string, Description>> => {
    try {
        const base = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${base}data/descriptions.json`, { cache: 'no-store' });
        const data: DescriptionsMap = await response.json();

        // Transform any remaining legacy string formats to objects
        const normalized: Record<string, Description> = {};
        Object.keys(data).forEach(key => {
            const val = data[key];
            normalized[key] = typeof val === 'string' ? { text: val, instagramUrl: '' } : val as Description; // Cast to Description as val could be string or Description
        });
        return normalized;
    } catch (error) {
        console.error('Error loading descriptions:', error);
        return {};
    }
};
