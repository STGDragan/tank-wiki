
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { Star, Zap, Crown } from "lucide-react";

export function ExperienceStep({ data, onUpdate, onNext }: WizardStepProps) {
  const experienceLevels = [
    {
      value: 'beginner',
      label: 'Beginner',
      icon: Star,
      description: 'New to aquariums, looking for guidance',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      value: 'intermediate',
      label: 'Intermediate', 
      icon: Zap,
      description: 'Some experience, ready for new challenges',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      value: 'expert',
      label: 'Expert',
      icon: Crown,
      description: 'Experienced hobbyist, knows the ropes',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ];

  const handleSelect = (level: string) => {
    onUpdate({ experienceLevel: level });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">What is your aquarium experience level?</h2>
        <p className="text-muted-foreground">This helps us customize the guidance for you</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {experienceLevels.map((level) => {
          const IconComponent = level.icon;
          const isSelected = data.experienceLevel === level.value;
          
          return (
            <Card 
              key={level.value}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => handleSelect(level.value)}
            >
              <CardHeader className="text-center pb-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-3">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{level.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-3">{level.description}</p>
                {isSelected && (
                  <Badge className={level.color}>Selected</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!data.experienceLevel}
          className="min-w-24"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
