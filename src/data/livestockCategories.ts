
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
      // Shrimp Species
      "Skunk Cleaner Shrimp", "Peppermint Shrimp", "Fire Shrimp", "Banded Coral Shrimp",
      "Sexy Shrimp", "Anemone Shrimp", "Camel Shrimp", "Glass Shrimp", "Yellow Line Shrimp",
      "Dwarf Coral Shrimp", "Red Skunk Cleaner Shrimp", "Tiger Pistol Shrimp",
      "Glass Anemone Shrimp", "Red Banded Pistol Shrimp", "Harlequin Shrimp",
      "Blood Shrimp", "Tiger Shrimp",
      
      // Crab Species
      "Blue Leg Hermit Crab", "Emerald Crab", "Porcelain Crab", "Halloween Hermit Crab",
      "White Claw Hermit Crab", "Scarlet Reef Hermit Crab", "Electric Blue Hermit Crab",
      "Zebra Hermit Crab", "Pom Pom Crab", "Mithrax Crab", "Porcelain Anemone Crab",
      
      // Snail Species
      "Nassarius Snail", "Turbo Snail", "Cerith Snail", "Trochus Snail", "Astrea Snail",
      "Bumblebee Snail", "Margarita Snail", "Limpet", "Collonista Snail", "Stomatella Snail",
      "Tectus Snail", "Conch", "Olive Snail", "Dove Snail", "Chestnut Cowrie",
      "Keyhole Limpet", "Spiny Astrea Snail", "Nassarius Vibex Snail",
      
      // Starfish Species
      "Fromia Starfish", "Sand Sifting Starfish", "Red Knob Sea Star",
      
      // Urchin Species
      "Tuxedo Urchin", "Long-Spined Urchin", "Pencil Urchin", "Purple Short Spine Urchin",
      "White Pencil Urchin", "Blue Tuxedo Urchin", "Long Spine Urchin",
      
      // Sea Cucumbers
      "Tiger Tail Cucumber", "Pink & Black Cucumber",
      
      // Worms and Filter Feeders
      "Feather Duster Worm", "Christmas Tree Worm", "Bristle Worm", "Spaghetti Worm",
      "Hawaiian Feather Duster", "Coco Worm", "Fan Worm", "Fireworm",
      
      // Anemones
      "Rock Flower Anemone", "Mini Maxi Carpet Anemone", "Ball Anemone",
      "Beaded Anemone", "Condylactis Anemone",
      
      // Clams
      "Maxima Clam", "Crocea Clam", "Derasa Clam", "Squamosa Clam",
      
      // Sponges
      "Yellow Ball Sponge", "Red Tree Sponge", "Purple Tube Sponge", "Blue Sponge"
    ]
  },
  {
    name: "Soft Corals",
    environments: ["reef"],
    species: [
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
    ]
  },
  {
    name: "LPS Corals",
    environments: ["reef"],
    species: [
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
    ]
  },
  {
    name: "SPS Corals",
    environments: ["reef"],
    species: [
      "Acropora", "Montipora", "Staghorn Coral", "Table Coral", "Bird's Nest Coral", 
      "Millepora", "Stylophora", "Seriatopora",
      
      // New SPS Coral Species from dataset
      "Leptoseris Coral", "Finger Coral", "Birdsnest Coral", "Blue Ridge Coral",
      "Fire Coral", "Star Coral", "Pavona Cactus Coral", "Staghorn Coral",
      "Sunset Montipora", "Cauliflower Coral", "Oculina Coral", "Pavona Coral"
    ]
  },
  {
    name: "Non-Photosynthetic Corals",
    environments: ["reef"],
    species: [
      "Sun Coral", "Carnation Coral", "Bamboo Coral",
      
      // New NPS Coral Species from dataset
      "Orange Sun Coral", "Yellow Sun Coral", "Cup Coral", "Precious Red Coral",
      "Lace Coral", "Black Coral", "Sea Whip Coral"
    ]
  },
  {
    name: "Gorgonians and Sea Fans",
    environments: ["reef"],
    species: [
      "Purple Sea Whip", "Yellow Gorgonian", "Red Sea Fan",
      
      // New Gorgonian Species from dataset
      "Purple Gorgonian"
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
