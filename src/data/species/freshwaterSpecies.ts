import { detailedFreshwaterFishNames } from './detailedFreshwaterFishData';

export const freshwaterFish = [
  // Add all the detailed freshwater fish species
  ...detailedFreshwaterFishNames,
  
  // Keep any existing species that might not be in the detailed data
  "White Cloud Mountain Minnow", "Siamese Algae Eater"
];

export const freshwaterInvertebrates = [
  "Cherry Shrimp", "Amano Shrimp", "Ghost Shrimp", "Crystal Red Shrimp", 
  "Crystal Black Shrimp", "Bamboo Shrimp", "Vampire Shrimp", "Nerite Snail", 
  "Mystery Snail", "Ramshorn Snail", "Malaysian Trumpet Snail", "Assassin Snail", 
  "Electric Blue Crayfish", "Red Swamp Crayfish", "Orange CPO Crayfish"
];

export const aquaticPlants = [
  "Java Moss", "Anubias", "Amazon Sword", "Vallisneria", "Cryptocoryne", 
  "Rotala", "Ludwigia", "Elodea", "Cabomba", "Hornwort"
];
