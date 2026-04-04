export const resolvePublicUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    const baseUrl = import.meta.env.BASE_URL || '/';

    // INTERCEPT: Redirect any 'images/' folder content (except the logo) to Supabase Cloud.
    if (url.includes('images/') && !url.includes('logo.webp')) {
        // 1. Remove base URL prefix if present (e.g. /Vardhan-Vishnu-nef/)
        let cleanPath = url;
        if (baseUrl !== '/' && url.startsWith(baseUrl)) {
            cleanPath = url.substring(baseUrl.length);
        }
        
        // 2. Normalize leading slash
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        
        // 3. Strip 'public/' prefix if Vite/StoryLoader included it
        if (cleanPath.startsWith('public/')) cleanPath = cleanPath.substring(7);

        // 4. On Supabase, the images are stored relative to 'public/images/'.
        // So 'images/stories/x.webp' becomes just 'stories/x.webp' in the bucket.
        // We handle any subfolder under images/ by stripping the prefix.
        const pathPart = cleanPath.startsWith('images/') ? cleanPath.substring(7) : cleanPath;
        
        // Cache Buster: Increment this if images are re-uploaded but showing old versions
        const version = '2024.1'; 
        
        return `https://svqkjpmbbdppdounyusu.supabase.co/storage/v1/object/public/portfolio-images/${pathPart}?v=${version}`;
    }

    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}${cleanPath}`;
};
