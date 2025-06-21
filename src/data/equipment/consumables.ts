
export interface ConsumableType {
  name: string;
  compatibleEquipment: string[];
  maintenanceFrequency: string[];
}

export const consumableTypes: ConsumableType[] = [
  {
    name: "Filter Cartridge",
    compatibleEquipment: ["Filter"],
    maintenanceFrequency: ["monthly", "every 2 months", "every 3 months"]
  },
  {
    name: "Carbon Media",
    compatibleEquipment: ["Filter"],
    maintenanceFrequency: ["monthly", "every 2 months"]
  },
  {
    name: "Bio Media",
    compatibleEquipment: ["Filter"],
    maintenanceFrequency: ["every 6 months", "annually"]
  },
  {
    name: "Filter Pad/Sponge",
    compatibleEquipment: ["Filter"],
    maintenanceFrequency: ["weekly", "every 2 weeks", "monthly"]
  },
  {
    name: "UV Bulb",
    compatibleEquipment: ["UV Sterilizer"],
    maintenanceFrequency: ["every 6 months", "annually"]
  },
  {
    name: "LED Array",
    compatibleEquipment: ["Light"],
    maintenanceFrequency: ["every 2 years", "every 3 years"]
  },
  {
    name: "Impeller",
    compatibleEquipment: ["Filter", "Powerhead", "Protein Skimmer"],
    maintenanceFrequency: ["annually", "every 2 years"]
  },
  {
    name: "O-Rings",
    compatibleEquipment: ["Filter", "Protein Skimmer"],
    maintenanceFrequency: ["annually", "every 2 years"]
  }
];
