
export interface WizardData {
  experienceLevel: string;
  tankGoal: string;
  selectedSpecies: string[];
  placement: {
    awayFromSunlight: boolean;
    nearWaterSource: boolean;
    nearPowerOutlet: boolean;
    levelSurface: boolean;
  };
  tankSize: number;
  tankShape: string;
  equipment: string[];
  wantsCycleReminders: boolean;
  inhabitantOrder: string[];
  [key: string]: any; // Add index signature to make it compatible with Json type
}

export interface WizardStepProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
  onNext?: () => void;
  onPrev?: () => void;
}
