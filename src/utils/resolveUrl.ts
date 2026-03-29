export const resolvePublicUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // INTERCEPT: Only redirect the 'stories' directory to Cloud Storage. Keep logos local.
    if (url.includes('images/stories')) {
        const cleanPath = url.includes('/public/') ? url.split('/public/')[1] : url.startsWith('/') ? url.substring(1) : url;
        return `https://svqkjpmbbdppdounyusu.supabase.co/storage/v1/object/public/portfolio-images/${cleanPath.replace('images/', '')}`;
    }

    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}${cleanPath}`;
};
