
import { 
  freshwaterFish, 
  freshwaterInvertebrates, 
  aquaticPlants 
} from './freshwaterSpecies';
import { saltwaterFish } from './saltwaterFish';
import { 
  marineShrimp, 
  marineCrabs, 
  marineSnails, 
  marineEchinoderms, 
  marineWorms, 
  marineAnemones, 
  marineClams, 
  marineSponges 
} from './marineInvertebrates';
import { 
  softCorals, 
  lpsCorals, 
  spsCorals, 
  npsCorals, 
  gorgonians 
} from './coralSpecies';
import { 
  anemoneSpecies, 
  clamSpecies, 
  jellyfishSpecies, 
  brackishSpecies, 
  coldwaterSpecies 
} from './specialtySpecies';

export interface LivestockCategory {
  name: string;
  environments: string[];
  species: string[];
}

export const livestockCategories: LivestockCategory[] = [
  {
    name: "Freshwater Fish",
    environments: ["freshwater"],
    species: freshwaterFish
  },
  {
    name: "Freshwater Invertebrates",
    environments: ["freshwater"],
    species: freshwaterInvertebrates
  },
  {
    name: "Aquatic Plants",
    environments: ["freshwater"],
    species: aquaticPlants
  },
  {
    name: "Saltwater Fish",
    environments: ["saltwater", "reef"],
    species: saltwaterFish
  },
  {
    name: "Marine Invertebrates",
    environments: ["saltwater", "reef"],
    species: [
      ...marineShrimp,
      ...marineCrabs,
      ...marineSnails,
      ...marineEchinoderms,
      ...marineWorms,
      ...marineAnemones,
      ...marineClams,
      ...marineSponges
    ]
  },
  {
    name: "Soft Corals",
    environments: ["reef"],
    species: softCorals
  },
  {
    name: "LPS Corals",
    environments: ["reef"],
    species: lpsCorals
  },
  {
    name: "SPS Corals",
    environments: ["reef"],
    species: spsCorals
  },
  {
    name: "Non-Photosynthetic Corals",
    environments: ["reef"],
    species: npsCorals
  },
  {
    name: "Gorgonians and Sea Fans",
    environments: ["reef"],
    species: gorgonians
  },
  {
    name: "Anemones",
    environments: ["reef"],
    species: anemoneSpecies
  },
  {
    name: "Clams",
    environments: ["reef"],
    species: clamSpecies
  },
  {
    name: "Jellyfish",
    environments: ["saltwater", "reef"],
    species: jellyfishSpecies
  },
  {
    name: "Brackish Species",
    environments: ["brackish"],
    species: brackishSpecies
  },
  {
    name: "Coldwater Species",
    environments: ["coldwater"],
    species: coldwaterSpecies
  }
];

// Export helper functions
export function getAllSpecies(): string[] {
  return livestockCategories.flatMap(category => category.species);
}

export function getCategorizedSpecies(): Array<{ name: string; species: string[] }> {
  return livestockCategories.map(category => ({
    name: category.name,
    species: category.species
  }));
}
