
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
      { name: "Fluval", models: ["407", "307", "207", "FX4", "FX6", "Other"] },
      { name: "Eheim", models: ["Classic 250", "Pro 4+", "2217", "Other"] },
      { name: "Marineland", models: ["Magniflow", "C-Series", "Other"] },
      { name: "AquaClear", models: ["20", "30", "50", "70", "Other"] },
      { name: "Other", models: ["Other"] }
    ]
  },
  {
    type: "Heater",
    brands: [
      { name: "Fluval", models: ["E-Series", "M-Series", "Other"] },
      { name: "Eheim", models: ["Jager", "ThermoControl", "Other"] },
      { name: "Aqueon", models: ["Pro", "Preset", "Other"] },
      { name: "Marineland", models: ["Precision", "Stealth Pro", "Other"] },
      { name: "Other", models: ["Other"] }
    ]
  },
  {
    type: "Light",
    brands: [
      { name: "AI", models: ["Prime 16HD", "Hydra 32HD", "Blade", "Other"] },
      { name: "Kessil", models: ["A160WE", "A360WE", "A80", "Other"] },
      { name: "Fluval", models: ["Marine 3.0", "Plant 3.0", "Sea", "Other"] },
      { name: "Current USA", models: ["Orbit", "Serene", "Other"] },
      { name: "Other", models: ["Other"] }
    ]
  },
  {
    type: "Powerhead",
    brands: [
      { name: "Tunze", models: ["6045", "6055", "6095", "Other"] },
      { name: "Hydor", models: ["Koralia", "Evolution", "Other"] },
      { name: "Maxspect", models: ["Gyre", "Jump", "Other"] },
      { name: "EcoTech", models: ["VorTech MP10", "VorTech MP40", "Other"] },
      { name: "Other", models: ["Other"] }
    ]
  },
  {
    type: "Protein Skimmer",
    brands: [
      { name: "Reef Octopus", models: ["Classic", "Regal", "Varios", "Other"] },
      { name: "Bubble Magus", models: ["Curve", "NAC", "Other"] },
      { name: "Red Sea", models: ["ReefWave", "RSK", "Other"] },
      { name: "Aquamaxx", models: ["ConeS", "HOB", "Other"] },
      { name: "Other", models: ["Other"] }
    ]
  },
  {
    type: "Other",
    brands: [
      { name: "Other", models: ["Other"] }
    ]
  }
];
