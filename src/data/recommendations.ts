
export const saltwaterRecommendations = [
  {
    type: 'livestock',
    name: 'Clownfish',
    description: 'A popular and hardy saltwater fish.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Clownfish',
  },
  {
    type: 'equipment',
    name: 'AI Prime 16HD Light',
    description: 'Powerful and popular reef tank lighting.',
    imageUrl: 'https://placehold.co/300x200/3B82F6/FFFFFF?text=AI+Prime',
  },
  {
    type: 'livestock',
    name: 'Royal Gramma',
    description: 'A beautiful and peaceful fish for reef tanks.',
    imageUrl: 'https://placehold.co/300x200/6D28D9/FFFFFF?text=Royal+Gramma',
  },
  {
    type: 'consumable',
    name: 'Red Sea Salt Mix',
    description: 'High-quality salt for creating optimal water conditions.',
    imageUrl: 'https://placehold.co/300x200/EF4444/FFFFFF?text=Red+Sea+Salt',
  },
  {
    type: 'food',
    name: 'Hikari Marine-S Pellets',
    description: 'Nutritious food for marine fish.',
    imageUrl: 'https://placehold.co/300x200/F59E0B/FFFFFF?text=Hikari+Food',
  },
];

export const freshwaterRecommendations = [
  {
    type: 'livestock',
    name: 'Java Fern',
    description: 'An easy-to-care-for plant, great for beginners.',
    imageUrl: 'https://placehold.co/300x200/16A34A/FFFFFF?text=Java+Fern',
  },
  {
    type: 'equipment',
    name: '50W Aquarium Heater',
    description: 'Essential for maintaining stable water temperature.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Heater',
  },
  {
    type: 'consumable',
    name: 'Seachem Prime',
    description: 'A complete and concentrated water conditioner.',
    imageUrl: 'https://placehold.co/300x200/9333EA/FFFFFF?text=Seachem',
  },
  {
    type: 'livestock',
    name: 'Neon Tetra',
    description: 'A small, peaceful, and vibrant schooling fish.',
    imageUrl: 'https://placehold.co/300x200/38BDF8/FFFFFF?text=Neon+Tetra',
  },
  {
    type: 'food',
    name: 'Hikari Micro Pellets',
    description: 'Ideal for small tropical fish.',
    imageUrl: 'https://placehold.co/300x200/F59E0B/FFFFFF?text=Hikari+Food',
  },
];

export type Recommendation = typeof saltwaterRecommendations[0];
