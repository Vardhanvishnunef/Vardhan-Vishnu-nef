
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

export interface Thought {
  role: 'admin' | 'user';
  text: string;
}

export interface SiteConfig {
  cover: { hero: string };
  home: {
    title: string;
    subtitle: string;
    items: PortfolioItem[];
    instagram_grid: string[];
  };
  stills: {
    title: string;
    description: string;
    items: PortfolioItem[];
  };
  info: {
    name: string;
    role: string;
    profile: string;
    quote: string;
    bio: string;
    creative_thoughts: Thought[];
    contact: {
      email: string;
      instagram: string;
      location: string;
      availability: string;
    };
  };
  stack: {
    main: string;
    sections: {
      title: string;
      items: { name: string; details: string; }[];
    }[];
  };
}

// Page type is now a string to support dynamic 'story-[slug]' routes
export type Page = 'cover' | 'home' | 'index' | 'stills' | 'stack' | 'info' | 'admin' | string;
