
export interface PortfolioItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  imageUrl: string;
  date?: string;
  location?: string;
  description?: string;
}

export interface Story {
  id: string;
  client: string;
  location: string;
  date: string;
  thumbnailUrl: string;
}

export interface StoryData {
  id: string;
  client: string;
  location: string;
  date: string;
  heroImage: string;
  thumbnailUrl: string;
  description: string;
  slug: string;
}

// Page type is now a string to support dynamic 'story-[slug]' routes
export type Page = 'cover' | 'home' | 'index' | 'stills' | 'stack' | 'info' | 'animate' | string;
