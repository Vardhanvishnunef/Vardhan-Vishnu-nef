export const resolvePublicUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // INTERCEPT: Redirect any 'images/' folder content (except the logo) to Supabase Cloud.
    if (url.includes('images/') && !url.includes('logo.webp')) {
        const cleanPath = url.includes('/public/') ? url.split('/public/')[1] : url.startsWith('/') ? url.substring(1) : url;
        // On Supabase, the files are stored relative to the 'public/images/' directory.
        return `https://svqkjpmbbdppdounyusu.supabase.co/storage/v1/object/public/portfolio-images/${cleanPath.replace('images/', '')}`;
    }

    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}${cleanPath}`;
};
