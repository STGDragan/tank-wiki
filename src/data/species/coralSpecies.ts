
export const softCorals = [
  // Original species
  "Zoanthid Coral", "Mushroom Coral", "Kenya Tree Coral", "Toadstool Coral", 
  "Star Polyp", "Xenia",
  
  // Previous additions
  "Green Button Polyps", "Zoanthids", "Clove Polyps", "Ricordea Mushroom",
  "Yuma Mushroom", "Elephant Ear Mushroom", "Anthelia Coral",
  "Long Polyp Leather Coral", "Finger Leather Coral", "Cabbage Leather Coral",
  "Devil's Hand Coral",
  
  // New Soft Coral Species from dataset
  "Toadstool Leather Coral", "Pulsing Xenia", "Green Star Polyp", "Ricordea Mushroom",
  "Finger Leather Coral", "Colt Coral", "Spaghetti Leather Coral", "Hairy Mushroom Coral",
  "Blue Mushroom Coral", "Devil's Hand Coral", "Encrusting Gorgonian", "Clove Polyps",
  "Anthelia Coral", "Tree Coral", "Red Pipe Organ Coral", "Bounce Mushroom"
];

export const lpsCorals = [
  // Original species
  "Hammer Coral", "Torch Coral", "Frogspawn", "Brain Coral", "Acan Coral", 
  "Chalice Coral",
  
  // Previous additions  
  "Plate Coral", "Acan Lord Coral", "Goniopora Coral", "Open Brain Coral",
  "Plate Fungia Coral",
  
  // New LPS Coral Species from dataset
  "Lobophyllia Brain Coral", "Galaxy Coral", "Favia Brain Coral", "Moon Coral",
  "Candy Cane Coral", "Blastomussa Coral", "Cactus Coral", "Wellsophyllia Brain Coral",
  "Scoly Coral", "Doughnut Coral", "Pineapple Coral", "Horn Coral", "Grape Coral",
  "Meat Coral", "Hammer Coral (Wall Form)", "Button Coral", "Frogspawn Coral (Wall Form)",
  "Grape Torch Coral", "Turbinaria Coral", "Pearl Bubble Coral"
];

export const spsCorals = [
  "Acropora", "Montipora", "Staghorn Coral", "Table Coral", "Bird's Nest Coral", 
  "Millepora", "Stylophora", "Seriatopora",
  
  // New SPS Coral Species from dataset
  "Leptoseris Coral", "Finger Coral", "Birdsnest Coral", "Blue Ridge Coral",
  "Fire Coral", "Star Coral", "Pavona Cactus Coral", "Staghorn Coral",
  "Sunset Montipora", "Cauliflower Coral", "Oculina Coral", "Pavona Coral"
];

export const npsCorals = [
  "Sun Coral", "Carnation Coral", "Bamboo Coral",
  
  // New NPS Coral Species from dataset
  "Orange Sun Coral", "Yellow Sun Coral", "Cup Coral", "Precious Red Coral",
  "Lace Coral", "Black Coral", "Sea Whip Coral"
];

export const gorgonians = [
  "Purple Sea Whip", "Yellow Gorgonian", "Red Sea Fan",
  
  // New Gorgonian Species from dataset
  "Purple Gorgonian"
];

// Add the missing coralSpecies export that combines all coral types
export const coralSpecies = [
  ...softCorals,
  ...lpsCorals,
  ...spsCorals,
  ...npsCorals,
  ...gorgonians
];
