
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExperienceStep } from "./steps/ExperienceStep";
import { TankGoalStep } from "./steps/TankGoalStep";
import { PlacementStep } from "./steps/PlacementStep";
import { SizeShapeStep } from "./steps/SizeShapeStep";
import { EquipmentStep } from "./steps/EquipmentStep";
import { SetupGuideStep } from "./steps/SetupGuideStep";
import { InhabitantsStep } from "./steps/InhabitantsStep";
import { SummaryStep } from "./steps/SummaryStep";
import { ChevronLeft, ChevronRight, Fish } from "lucide-react";
import { WizardData } from "./types";

interface AquariumSetupWizardProps {
  aquariumCount: number;
}

export function AquariumSetupWizard({ aquariumCount }: AquariumSetupWizardProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    experienceLevel: '',
    tankGoal: '',
    selectedSpecies: [],
    placement: {
      awayFromSunlight: false,
      nearWaterSource: false,
      nearPowerOutlet: false,
      levelSurface: false
    },
    tankSize: 0,
    tankShape: '',
    equipment: [],
    wantsCycleReminders: false,
    inhabitantOrder: []
  });

  const steps = [
    "Experience Level",
    "Tank Goal & Species",
    "Placement",
    "Size & Shape", 
    "Equipment",
    "Setup Guide",
    "Inhabitants",
    "Summary"
  ];

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <ExperienceStep data={wizardData} onUpdate={updateWizardData} onNext={nextStep} />;
      case 1:
        return <TankGoalStep data={wizardData} onUpdate={updateWizardData} onNext={nextStep} onPrev={prevStep} />;
      case 2:
        return <PlacementStep data={wizardData} onUpdate={updateWizardData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <SizeShapeStep data={wizardData} onUpdate={updateWizardData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <EquipmentStep data={wizardData} onUpdate={updateWizardData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <SetupGuideStep data={wizardData} onUpdate={updateWizardData} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return <InhabitantsStep data={wizardData} onUpdate={updateWizardData} onNext={nextStep} onPrev={prevStep} />;
      case 7:
        return <SummaryStep data={wizardData} onUpdate={updateWizardData} aquariumCount={aquariumCount} onClose={() => setOpen(false)} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:from-blue-100 hover:to-cyan-100">
          <Fish className="h-4 w-4 mr-2" />
          🐟 Aquarium Setup Wizard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fish className="h-5 w-5 text-blue-600" />
            Aquarium Setup Wizard
          </DialogTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{steps[currentStep]}</span>
            </div>
            <Progress value={(currentStep + 1) / steps.length * 100} className="h-2" />
          </div>
        </DialogHeader>
        
        <div className="mt-6">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
