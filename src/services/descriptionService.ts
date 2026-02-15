
export interface DescriptionMap {
    [imageUrl: string]: string;
}

export const loadDescriptions = async (): Promise<DescriptionMap> => {
    try {
        const response = await fetch('/data/descriptions.json');
        if (!response.ok) {
            console.warn('Failed to load descriptions.json');
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading descriptions:', error);
        return {};
    }
};
