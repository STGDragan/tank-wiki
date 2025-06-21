
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
      color: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-800/30 dark:border-green-600 dark:text-green-200'
    },
    {
      value: 'intermediate',
      label: 'Intermediate', 
      icon: Zap,
      description: 'Some experience, ready for new challenges',
      color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-800/30 dark:border-blue-600 dark:text-blue-200'
    },
    {
      value: 'expert',
      label: 'Expert',
      icon: Crown,
      description: 'Experienced hobbyist, knows the ropes',
      color: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-800/30 dark:border-purple-600 dark:text-purple-200'
    }
  ];

  const handleSelect = (level: string) => {
    onUpdate({ experienceLevel: level });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-foreground dark:text-slate-100">What is your aquarium experience level?</h2>
        <p className="text-muted-foreground dark:text-slate-400">This helps us customize the guidance for you</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {experienceLevels.map((level) => {
          const IconComponent = level.icon;
          const isSelected = data.experienceLevel === level.value;
          
          return (
            <Card 
              key={level.value}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 border-2 dark:bg-slate-800/50 dark:border-slate-600 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-500' 
                  : 'hover:shadow-md dark:hover:bg-slate-700/50'
              }`}
              onClick={() => handleSelect(level.value)}
            >
              <CardHeader className="text-center pb-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800/50 dark:to-cyan-800/50 flex items-center justify-center mb-3">
                  <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg text-foreground dark:text-slate-100">{level.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground dark:text-slate-300 mb-3">{level.description}</p>
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
