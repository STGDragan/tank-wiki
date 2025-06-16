
export const saltwaterRecommendations = [
  {
    type: 'livestock',
    name: 'Clownfish',
    description: 'A popular and hardy saltwater fish.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Clownfish',
  },
  {
    type: 'livestock',
    name: 'Royal Gramma',
    description: 'A beautiful and peaceful fish for reef tanks.',
    imageUrl: 'https://placehold.co/300x200/6D28D9/FFFFFF?text=Royal+Gramma',
  },
  {
    type: 'livestock',
    name: 'Cardinal Fish',
    description: 'Peaceful schooling fish perfect for reef environments.',
    imageUrl: 'https://placehold.co/300x200/DC2626/FFFFFF?text=Cardinal+Fish',
  },
  {
    type: 'livestock',
    name: 'Coral Beauty Angelfish',
    description: 'Stunning coloration and reef-safe behavior.',
    imageUrl: 'https://placehold.co/300x200/F59E0B/FFFFFF?text=Coral+Beauty',
  },
  {
    type: 'equipment',
    name: 'AI Prime 16HD Light',
    description: 'Powerful and popular reef tank lighting.',
    imageUrl: 'https://placehold.co/300x200/3B82F6/FFFFFF?text=AI+Prime',
  },
  {
    type: 'equipment',
    name: 'Protein Skimmer',
    description: 'Essential for maintaining water quality in saltwater tanks.',
    imageUrl: 'https://placehold.co/300x200/10B981/FFFFFF?text=Protein+Skimmer',
  },
  {
    type: 'equipment',
    name: 'Powerhead',
    description: 'Creates water movement crucial for coral health.',
    imageUrl: 'https://placehold.co/300x200/8B5CF6/FFFFFF?text=Powerhead',
  },
  {
    type: 'equipment',
    name: 'Heater',
    description: 'Maintains stable temperature for tropical marine life.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Marine+Heater',
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
    name: 'Neon Tetra',
    description: 'A small, peaceful, and vibrant schooling fish.',
    imageUrl: 'https://placehold.co/300x200/38BDF8/FFFFFF?text=Neon+Tetra',
  },
  {
    type: 'livestock',
    name: 'Java Fern',
    description: 'An easy-to-care-for plant, great for beginners.',
    imageUrl: 'https://placehold.co/300x200/16A34A/FFFFFF?text=Java+Fern',
  },
  {
    type: 'livestock',
    name: 'Corydoras Catfish',
    description: 'Peaceful bottom-dwelling fish that help keep the tank clean.',
    imageUrl: 'https://placehold.co/300x200/94A3B8/FFFFFF?text=Corydoras',
  },
  {
    type: 'livestock',
    name: 'Anubias Plant',
    description: 'Hardy aquatic plant that thrives in low light.',
    imageUrl: 'https://placehold.co/300x200/059669/FFFFFF?text=Anubias',
  },
  {
    type: 'equipment',
    name: '50W Aquarium Heater',
    description: 'Essential for maintaining stable water temperature.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Heater',
  },
  {
    type: 'equipment',
    name: 'LED Aquarium Light',
    description: 'Energy-efficient lighting for plant growth.',
    imageUrl: 'https://placehold.co/300x200/3B82F6/FFFFFF?text=LED+Light',
  },
  {
    type: 'equipment',
    name: 'Canister Filter',
    description: 'Powerful filtration for crystal clear water.',
    imageUrl: 'https://placehold.co/300x200/6366F1/FFFFFF?text=Canister+Filter',
  },
  {
    type: 'equipment',
    name: 'Air Pump',
    description: 'Provides essential oxygenation for fish.',
    imageUrl: 'https://placehold.co/300x200/84CC16/FFFFFF?text=Air+Pump',
  },
  {
    type: 'consumable',
    name: 'Seachem Prime',
    description: 'A complete and concentrated water conditioner.',
    imageUrl: 'https://placehold.co/300x200/9333EA/FFFFFF?text=Seachem',
  },
  {
    type: 'food',
    name: 'Hikari Micro Pellets',
    description: 'Ideal for small tropical fish.',
    imageUrl: 'https://placehold.co/300x200/F59E0B/FFFFFF?text=Hikari+Food',
  },
];

export type Recommendation = typeof saltwaterRecommendations[0];
