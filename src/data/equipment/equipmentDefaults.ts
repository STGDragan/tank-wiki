
export interface EquipmentDefault {
  type: string;
  brands: {
    name: string;
    models: string[];
  }[];
}

export const equipmentDefaults: EquipmentDefault[] = [
  {
    type: "Filter",
    brands: [
      { name: "Fluval", models: ["407", "307", "207", "FX4", "FX6"] },
      { name: "Eheim", models: ["Classic 250", "Pro 4+", "2217"] },
      { name: "Marineland", models: ["Magniflow", "C-Series"] },
      { name: "AquaClear", models: ["20", "30", "50", "70"] },
      { name: "Other", models: [] }
    ]
  },
  {
    type: "Heater",
    brands: [
      { name: "Fluval", models: ["E-Series", "M-Series"] },
      { name: "Eheim", models: ["Jager", "ThermoControl"] },
      { name: "Aqueon", models: ["Pro", "Preset"] },
      { name: "Marineland", models: ["Precision", "Stealth Pro"] },
      { name: "Other", models: [] }
    ]
  },
  {
    type: "Light",
    brands: [
      { name: "AI", models: ["Prime 16HD", "Hydra 32HD", "Blade"] },
      { name: "Kessil", models: ["A160WE", "A360WE", "A80"] },
      { name: "Fluval", models: ["Marine 3.0", "Plant 3.0", "Sea"] },
      { name: "Current USA", models: ["Orbit", "Serene"] },
      { name: "Other", models: [] }
    ]
  },
  {
    type: "Powerhead",
    brands: [
      { name: "Tunze", models: ["6045", "6055", "6095"] },
      { name: "Hydor", models: ["Koralia", "Evolution"] },
      { name: "Maxspect", models: ["Gyre", "Jump"] },
      { name: "EcoTech", models: ["VorTech MP10", "VorTech MP40"] },
      { name: "Other", models: [] }
    ]
  },
  {
    type: "Protein Skimmer",
    brands: [
      { name: "Reef Octopus", models: ["Classic", "Regal", "Varios"] },
      { name: "Bubble Magus", models: ["Curve", "NAC"] },
      { name: "Red Sea", models: ["ReefWave", "RSK"] },
      { name: "Aquamaxx", models: ["ConeS", "HOB"] },
      { name: "Other", models: [] }
    ]
  }
];
