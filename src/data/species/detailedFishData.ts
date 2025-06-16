
export interface DetailedFishInfo {
  unique_id: string;
  category: string;
  family_name: string;
  species_name: string;
  min_tank_size: number;
  max_size: number;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced' | 'Expert';
  compatibility_notes: string;
  tank_mate_issues: string;
  tags: string[];
  tank_type: string;
}

export const detailedMarineFish: DetailedFishInfo[] = [
  {
    unique_id: "fish_201",
    category: "Fish",
    family_name: "Triggerfish",
    species_name: "Clown Triggerfish (Balistoides conspicillum)",
    min_tank_size: 180,
    max_size: 20,
    difficulty: "Advanced",
    compatibility_notes: "Aggressive, territorial; will eat inverts",
    tank_mate_issues: "Will eat crustaceans, snails, small fish, and corals",
    tags: ["trigger", "aggressive", "predatory"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_202",
    category: "Fish",
    family_name: "Pufferfish",
    species_name: "Dogface Puffer (Arothron nigropunctatus)",
    min_tank_size: 125,
    max_size: 13,
    difficulty: "Intermediate",
    compatibility_notes: "Intelligent; can nip tankmates and decor",
    tank_mate_issues: "Not reef safe, may nip corals and inverts",
    tags: ["puffer", "dogface", "nipper"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_203",
    category: "Fish",
    family_name: "Boxfish",
    species_name: "Cubicus Boxfish (Ostracion cubicus)",
    min_tank_size: 180,
    max_size: 18,
    difficulty: "Advanced",
    compatibility_notes: "Can release toxins when stressed",
    tank_mate_issues: "Reef unsafe due to size and toxin risk",
    tags: ["boxfish", "cowfish", "toxic"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_204",
    category: "Fish",
    family_name: "Grouper",
    species_name: "Miniatus Grouper (Cephalopholis miniata)",
    min_tank_size: 180,
    max_size: 16,
    difficulty: "Advanced",
    compatibility_notes: "Very aggressive predator",
    tank_mate_issues: "Will eat smaller fish and inverts",
    tags: ["grouper", "predator", "miniatus"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_205",
    category: "Fish",
    family_name: "Filefish",
    species_name: "Orange Spotted Filefish (Oxymonacanthus longirostris)",
    min_tank_size: 55,
    max_size: 5,
    difficulty: "Expert",
    compatibility_notes: "Specialized diet of coral polyps",
    tank_mate_issues: "Coral eater, not reef safe",
    tags: ["filefish", "coral eater"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_206",
    category: "Fish",
    family_name: "Anglerfish",
    species_name: "Wartskin Anglerfish (Antennarius maculatus)",
    min_tank_size: 30,
    max_size: 5,
    difficulty: "Intermediate",
    compatibility_notes: "Ambush predator",
    tank_mate_issues: "Will eat anything it can fit in its mouth",
    tags: ["angler", "frogfish", "predator"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_207",
    category: "Fish",
    family_name: "Lionfish",
    species_name: "Volitan Lionfish (Pterois volitans)",
    min_tank_size: 120,
    max_size: 15,
    difficulty: "Intermediate",
    compatibility_notes: "Venomous spines, slow swimmer",
    tank_mate_issues: "Will eat smaller tankmates",
    tags: ["lionfish", "venomous", "predator"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_208",
    category: "Fish",
    family_name: "Moray Eel",
    species_name: "Zebra Moray Eel (Gymnomuraena zebra)",
    min_tank_size: 125,
    max_size: 36,
    difficulty: "Advanced",
    compatibility_notes: "Secretive, burrower",
    tank_mate_issues: "May eat crustaceans, needs secure lid",
    tags: ["eel", "moray", "carnivore"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_209",
    category: "Fish",
    family_name: "Rabbitfish",
    species_name: "Foxface Rabbitfish (Siganus vulpinus)",
    min_tank_size: 75,
    max_size: 9,
    difficulty: "Intermediate",
    compatibility_notes: "May eat nuisance algae",
    tank_mate_issues: "May nip LPS corals occasionally",
    tags: ["rabbitfish", "foxface", "algae eater"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_210",
    category: "Fish",
    family_name: "Snapper",
    species_name: "Blue-lined Snapper (Lutjanus kasmira)",
    min_tank_size: 200,
    max_size: 24,
    difficulty: "Advanced",
    compatibility_notes: "Active, fast-growing schooling fish",
    tank_mate_issues: "Eats smaller fish and shrimp",
    tags: ["snapper", "schooling", "aggressive"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_211",
    category: "Fish",
    family_name: "Wrasse",
    species_name: "Dragon Wrasse (Novaculichthys taeniourus)",
    min_tank_size: 125,
    max_size: 12,
    difficulty: "Intermediate",
    compatibility_notes: "Destructive; rearranges tank decor",
    tank_mate_issues: "Not reef safe, predatory toward inverts",
    tags: ["wrasse", "dragon", "aggressive"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_212",
    category: "Fish",
    family_name: "Pufferfish",
    species_name: "Mappa Puffer (Arothron mappa)",
    min_tank_size: 180,
    max_size: 18,
    difficulty: "Advanced",
    compatibility_notes: "Large, intelligent; needs varied diet",
    tank_mate_issues: "May eat crustaceans, corals, and anemones",
    tags: ["puffer", "large", "mappa"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_213",
    category: "Fish",
    family_name: "Triggerfish",
    species_name: "Picasso Triggerfish (Rhinecanthus aculeatus)",
    min_tank_size: 120,
    max_size: 10,
    difficulty: "Intermediate",
    compatibility_notes: "Hardy, aggressive",
    tank_mate_issues: "Will attack inverts and smaller fish",
    tags: ["trigger", "Picasso", "reef unsafe"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_214",
    category: "Fish",
    family_name: "Toadfish",
    species_name: "Gulf Toadfish (Opsanus beta)",
    min_tank_size: 55,
    max_size: 11,
    difficulty: "Advanced",
    compatibility_notes: "Ambush predator with venomous spines",
    tank_mate_issues: "Will eat small fish/inverts",
    tags: ["toadfish", "venomous", "cryptic"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_215",
    category: "Fish",
    family_name: "Pufferfish",
    species_name: "Stars and Stripes Puffer (Arothron hispidus)",
    min_tank_size: 150,
    max_size: 18,
    difficulty: "Advanced",
    compatibility_notes: "Aggressive, intelligent",
    tank_mate_issues: "Not reef safe, can eat corals and inverts",
    tags: ["puffer", "stars and stripes", "large"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_216",
    category: "Fish",
    family_name: "Grouper",
    species_name: "Panther Grouper (Cromileptes altivelis)",
    min_tank_size: 200,
    max_size: 27,
    difficulty: "Advanced",
    compatibility_notes: "Striking appearance, grows very large",
    tank_mate_issues: "Will eat smaller fish, not reef safe",
    tags: ["grouper", "panther", "large"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_217",
    category: "Fish",
    family_name: "Scorpionfish",
    species_name: "Leaf Scorpionfish (Taenianotus triacanthus)",
    min_tank_size: 30,
    max_size: 4,
    difficulty: "Intermediate",
    compatibility_notes: "Venomous, motionless predator",
    tank_mate_issues: "Can eat small shrimp and fish",
    tags: ["scorpionfish", "venomous", "leaf"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_218",
    category: "Fish",
    family_name: "Triggerfish",
    species_name: "Undulate Triggerfish (Balistapus undulatus)",
    min_tank_size: 125,
    max_size: 12,
    difficulty: "Advanced",
    compatibility_notes: "One of the most aggressive triggers",
    tank_mate_issues: "Not reef safe, territorial",
    tags: ["trigger", "undulate", "aggressive"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_219",
    category: "Fish",
    family_name: "Pufferfish",
    species_name: "Valentini Puffer (Canthigaster valentini)",
    min_tank_size: 30,
    max_size: 4,
    difficulty: "Intermediate",
    compatibility_notes: "May be kept in reef with caution",
    tank_mate_issues: "Can nip corals and inverts",
    tags: ["puffer", "valentini", "small"],
    tank_type: "saltwater, fish only"
  },
  {
    unique_id: "fish_220",
    category: "Fish",
    family_name: "Hawkfish",
    species_name: "Longnose Hawkfish (Oxycirrhites typus)",
    min_tank_size: 40,
    max_size: 5,
    difficulty: "Intermediate",
    compatibility_notes: "Perches on corals; bold personality",
    tank_mate_issues: "May eat shrimp; not ideal with nano inverts",
    tags: ["hawkfish", "longnose", "perch"],
    tank_type: "saltwater, fish only"
  }
];

// Helper function to get detailed info for a species
export function getDetailedFishInfo(speciesName: string): DetailedFishInfo | undefined {
  return detailedMarineFish.find(fish => 
    fish.species_name.toLowerCase().includes(speciesName.toLowerCase()) ||
    speciesName.toLowerCase().includes(fish.species_name.split('(')[0].trim().toLowerCase())
  );
}

// Extract just the common names for the existing species selector
export const detailedMarineFishNames = detailedMarineFish.map(fish => 
  fish.species_name.split('(')[0].trim()
);
