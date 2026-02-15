
import { PortfolioItem, Story } from './types';

export const COLORS = {
  primary: '#e63519',
  limestone: '#F2F0EB',
  paper: '#FCFAF7',
  charcoal: '#1A1918',
  muted: '#8C8A85',
};

export const MOCK_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    title: 'The Jodhpur Suite',
    category: 'Portrait',
    imageUrl: '/images/portraits/jodhpur-suite.jpg',
    date: '2024',
    subtitle: 'FILM 01',
    description: 'A study of light and heritage in the Blue City, captured on 35mm.'
  },
  {
    id: '2',
    title: 'Udaipur Dusk',
    category: 'Wedding',
    subtitle: 'CEREMONY',
    imageUrl: '/images/weddings/udaipur-dusk.jpg',
    date: '2024'
  },
  {
    id: '3',
    title: 'Silhouettes of Grace',
    category: 'Portrait',
    subtitle: 'MONOCHROME',
    imageUrl: '/images/portraits/silhouettes.jpg',
    date: '2023'
  },
  {
    id: '4',
    title: 'The Saffron Bloom',
    category: 'Ceremony',
    subtitle: 'HALDI',
    description: '"Chaos and color in perfect harmony. A cinematic take on traditional Indian celebrations."',
    imageUrl: '/images/ceremonies/saffron-bloom.jpg',
    date: '2024'
  }
];



export const MOCK_STILLS: PortfolioItem[] = [
  { id: 's1', title: 'Eyes of the East', category: 'Portraits', location: 'Mumbai, 2023', imageUrl: '/images/stills/eyes-east.jpg', subtitle: '01' },
  { id: 's2', title: 'Heritage Arch', category: 'Objects', location: 'Kerala', imageUrl: '/images/stills/heritage-arch.jpg', subtitle: '02' },
  { id: 's3', title: 'The Gilded Door', category: 'Objects', location: 'Jaipur', imageUrl: '/images/stills/gilded-door.jpg', subtitle: '03' },
  { id: 's4', title: 'Midnight Stare', category: 'Portraits', location: 'Delhi', imageUrl: '/images/stills/midnight-stare.jpg', subtitle: '04' },
  { id: 's5', title: 'Ritual Fire', category: 'Objects', location: 'Varanasi', imageUrl: '/images/stills/ritual-fire.jpg', subtitle: '05' },
];

export const STATIC_IMAGES = {
  cover: {
    hero: '/images/cover/hero-portrait.jpg',
  },
  info: {
    profile: '/images/info/profile.jpg',
  },
  home: {
    instagram_grid: [
      '/images/home/insta-1.jpg',
      '/images/home/insta-2.webp',
      '/images/home/insta-3.webp',
      '/images/home/insta-4.jpg',
    ]
  },
  stack: {
    main: '/images/stack/main.jpg',
  }
};
