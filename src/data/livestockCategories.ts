// Organized by categories with environment compatibility
export const livestockCategories = [
  {
    name: "Freshwater Fish",
    environments: ["freshwater"],
    species: [
      "Neon Tetra", "Cardinal Tetra", "Guppy", "Molly", "Platy", "Swordtail", 
      "Betta", "Angelfish", "Discus", "Corydoras Catfish", "Otocinclus", 
      "Bristlenose Pleco", "Cherry Barb", "Tiger Barb", "Zebra Danio", 
      "White Cloud Mountain Minnow", "Harlequin Rasbora", "Rummy Nose Tetra", 
      "Siamese Algae Eater"
    ]
  },
  {
    name: "Freshwater Invertebrates",
    environments: ["freshwater"],
    species: [
      "Cherry Shrimp", "Amano Shrimp", "Ghost Shrimp", "Crystal Red Shrimp", 
      "Crystal Black Shrimp", "Bamboo Shrimp", "Vampire Shrimp", "Nerite Snail", 
      "Mystery Snail", "Ramshorn Snail", "Malaysian Trumpet Snail", "Assassin Snail", 
      "Electric Blue Crayfish", "Red Swamp Crayfish", "Orange CPO Crayfish"
    ]
  },
  {
    name: "Aquatic Plants",
    environments: ["freshwater"],
    species: [
      "Java Moss", "Anubias", "Amazon Sword", "Vallisneria", "Cryptocoryne", 
      "Rotala", "Ludwigia", "Elodea", "Cabomba", "Hornwort"
    ]
  },
  {
    name: "Saltwater Fish",
    environments: ["saltwater", "reef"],
    species: [
      "Ocellaris Clownfish", "Percula Clownfish", "Maroon Clownfish", "Tomato Clownfish",
      "Blue Tang", "Yellow Tang", "Purple Tang", "Sailfin Tang", "Powder Blue Tang",
      "Queen Angelfish", "French Angelfish", "Gray Angelfish", "Emperor Angelfish",
      "Six Line Wrasse", "Yellow Coris Wrasse", "Fairy Wrasse", "Cleaner Wrasse",
      "Mandarin Goby", "Yellow Watchman Goby", "Diamond Goby", "Firefish Goby",
      "Royal Gramma", "Cardinalfish", "Anthias", "Dottyback", "Blenny", 
      "Triggerfish", "Butterflyfish", "Grouper"
    ]
  },
  {
    name: "Marine Invertebrates",
    environments: ["saltwater", "reef"],
    species: [
      // Original species
      "Cleaner Shrimp", "Fire Shrimp", "Hermit Crab", "Turbo Snail", 
      "Nassarius Snail", "Conch", "Sea Urchin",
      
      // New Shrimp Species
      "Scarlet Skunk Cleaner Shrimp", "Peppermint Shrimp", "Blood Red Fire Shrimp",
      "Pistol Shrimp", "Coral Banded Shrimp", "Sexy Anemone Shrimp", "Camel Shrimp",
      
      // New Crab Species
      "Trapezia Coral Crab", "Emerald Crab", "Scarlet Reef Hermit Crab",
      "Electric Blue Hermit Crab", "Dwarf Blue Leg Hermit Crab", "Halloween Hermit Crab",
      "Pom Pom Crab", "Anemone Crab", "Sponge Crab", "Porcelain Crab",
      
      // Starfish Species
      "Brittle Star", "Serpent Star", "Blue Linckia Starfish", "Fromia Starfish",
      "Red Linckia Starfish", "Asterina Starfish", "Tile Starfish", "Sand Sifting Starfish",
      "Serpent Starfish", "Brittle Starfish",
      
      // Snail Species
      "Tectus Snail", "Trochus Snail", "Cerith Snail", "Astraea Snail",
      "Stomatella Snail", "Limpet",
      
      // Urchin Species
      "Tuxedo Urchin", "Long-Spined Urchin", "Pencil Urchin", "Blue Tuxedo Urchin",
      "Longspine Urchin", "Variegated Urchin", "Pin Cushion Urchin", "Heart Urchin",
      
      // Sea Cucumbers
      "Tiger Tail Cucumber", "Pink and Black Sea Cucumber", "Leopard Sea Cucumber",
      
      // Worms and Filter Feeders
      "Feather Duster Worm", "Christmas Tree Worm", "Bristle Worm", "Spaghetti Worm",
      
      // Other Invertebrates
      "Chiton", "Amphipod", "Copepod"
    ]
  },
  {
    name: "Soft Corals",
    environments: ["reef"],
    species: [
      // Original species
      "Zoanthid Coral", "Mushroom Coral", "Kenya Tree Coral", "Toadstool Coral", 
      "Star Polyp", "Xenia",
      
      // New Soft Coral Species
      "Green Button Polyps", "Zoanthids", "Clove Polyps", "Ricordea Mushroom",
      "Yuma Mushroom", "Elephant Ear Mushroom", "Anthelia Coral",
      "Long Polyp Leather Coral", "Finger Leather Coral", "Cabbage Leather Coral",
      "Devil's Hand Coral"
    ]
  },
  {
    name: "LPS Corals",
    environments: ["reef"],
    species: [
      // Original species
      "Hammer Coral", "Torch Coral", "Frogspawn", "Brain Coral", "Acan Coral", 
      "Chalice Coral",
      
      // New LPS Coral Species
      "Plate Coral", "Acan Lord Coral", "Goniopora Coral", "Open Brain Coral",
      "Plate Fungia Coral"
    ]
  },
  {
    name: "SPS Corals",
    environments: ["reef"],
    species: [
      "Acropora", "Montipora", "Staghorn Coral", "Table Coral", "Bird's Nest Coral", 
      "Millepora", "Stylophora", "Seriatopora"
    ]
  },
  {
    name: "Non-Photosynthetic Corals",
    environments: ["reef"],
    species: [
      "Sun Coral", "Carnation Coral", "Bamboo Coral"
    ]
  },
  {
    name: "Gorgonians and Sea Fans",
    environments: ["reef"],
    species: [
      "Purple Sea Whip", "Yellow Gorgonian", "Red Sea Fan"
    ]
  },
  {
    name: "Anemones",
    environments: ["reef"],
    species: [
      "Colonial Anemone", "Mini Carpet Anemone", "Rock Flower Anemone",
      "Sebae Anemone", "Bubble Tip Anemone", "Carpet Anemone"
    ]
  },
  {
    name: "Clams",
    environments: ["reef"],
    species: [
      "Maxima Clam", "Crocea Clam", "Derasa Clam"
    ]
  },
  {
    name: "Jellyfish",
    environments: ["saltwater", "reef"],
    species: [
      "Staurocladia Jelly", "Upside-Down Jellyfish", "Lagoon Jellyfish"
    ]
  },
  {
    name: "Brackish Species",
    environments: ["brackish"],
    species: [
      "Mollies", "Guppies", "Figure 8 Puffer", "Green Spotted Puffer", 
      "Archer Fish", "Mono Argentus", "Nerite Snails", "Amano Shrimp"
    ]
  },
  {
    name: "Coldwater Species",
    environments: ["coldwater"],
    species: [
      "Goldfish", "White Cloud Mountain Minnow", "Weather Loach", "Hillstream Loach"
    ]
  }
];
