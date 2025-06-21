
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { WizardStepProps } from "../types";
import { ChevronLeft, Sun, Droplet, Plug, Ruler } from "lucide-react";

export function PlacementStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const placementItems = [
    {
      key: 'awayFromSunlight' as keyof typeof data.placement,
      label: 'Away from direct sunlight',
      icon: Sun,
      description: 'Direct sunlight can cause algae growth and temperature fluctuations',
      emoji: '☀️'
    },
    {
      key: 'nearWaterSource' as keyof typeof data.placement,
      label: 'Close to water source',
      icon: Droplet,
      description: 'Makes water changes and top-offs much easier',
      emoji: '💧'
    },
    {
      key: 'nearPowerOutlet' as keyof typeof data.placement,
      label: 'Near power outlets',
      icon: Plug,
      description: 'Equipment needs reliable power connections',
      emoji: '🔌'
    },
    {
      key: 'levelSurface' as keyof typeof data.placement,
      label: 'Level, sturdy surface',
      icon: Ruler,
      description: 'Prevents stress on tank seams and ensures stability',
      emoji: '📏'
    }
  ];

  const handleCheckboxChange = (key: keyof typeof data.placement, checked: boolean) => {
    onUpdate({
      placement: {
        ...data.placement,
        [key]: checked
      }
    });
  };

  const allChecked = Object.values(data.placement).every(Boolean);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Tank Placement Checklist</h2>
        <p className="text-muted-foreground">Choose a safe location for your aquarium</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {placementItems.map((item) => {
          const IconComponent = item.icon;
          const isChecked = data.placement[item.key];
          
          return (
            <Card 
              key={item.key}
              className={`cursor-pointer transition-all duration-200 ${
                isChecked ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
              }`}
              onClick={() => handleCheckboxChange(item.key, !isChecked)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <span className="text-lg">{item.emoji}</span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.label}</CardTitle>
                    </div>
                  </div>
                  <Checkbox 
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(item.key, checked as boolean)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allChecked && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-medium text-green-800">Perfect! You've found an ideal location for your aquarium.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!allChecked}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
