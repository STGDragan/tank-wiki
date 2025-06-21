
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { ChevronLeft, Clock, Bell } from "lucide-react";

export function SetupGuideStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const setupSteps = [
    {
      step: 1,
      title: 'Prepare the Location',
      description: 'Clean the area and place your tank stand',
      emoji: '🧹'
    },
    {
      step: 2,
      title: 'Install Equipment',
      description: 'Set up filter, heater, and other equipment',
      emoji: '🔧'
    },
    {
      step: 3,
      title: 'Add Substrate',
      description: 'Rinse and add gravel, sand, or soil',
      emoji: '🪨'
    },
    {
      step: 4,
      title: 'Add Decorations',
      description: 'Place rocks, driftwood, and decorations',
      emoji: '🏺'
    },
    {
      step: 5,
      title: 'Fill with Water',
      description: 'Add dechlorinated water slowly',
      emoji: '💧'
    },
    {
      step: 6,
      title: 'Start Equipment',
      description: 'Turn on filter, heater, and lights',
      emoji: '⚡'
    },
    {
      step: 7,
      title: 'Begin Cycling',
      description: 'Start the nitrogen cycle process',
      emoji: '🔄'
    }
  ];

  const cyclingInfo = {
    freshwater: {
      duration: '2-6 weeks',
      method: 'Add ammonia source and beneficial bacteria',
      testing: 'Test ammonia, nitrite, and nitrate daily'
    },
    saltwater: {
      duration: '4-8 weeks',
      method: 'Add live rock or bacteria starter',
      testing: 'Test ammonia, nitrite, nitrate, and salinity'
    }
  };

  const isSaltwater = data.tankGoal.includes('Saltwater') || data.tankGoal.includes('Reef');
  const cycleInfo = isSaltwater ? cyclingInfo.saltwater : cyclingInfo.freshwater;

  const handleReminderToggle = (wantsReminders: boolean) => {
    onUpdate({ wantsCycleReminders: wantsReminders });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Setup Guide & Cycling Plan</h2>
        <p className="text-muted-foreground">Step-by-step instructions for your {data.tankGoal.toLowerCase()}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {setupSteps.map((step) => (
              <div key={step.step} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                  {step.step}
                </div>
                <span className="text-2xl">{step.emoji}</span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg text-amber-800">Tank Cycling Process</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-amber-800">Duration</p>
              <p className="text-sm text-amber-700">{cycleInfo.duration}</p>
            </div>
            <div>
              <p className="font-medium text-amber-800">Method</p>
              <p className="text-sm text-amber-700">{cycleInfo.method}</p>
            </div>
            <div>
              <p className="font-medium text-amber-800">Testing</p>
              <p className="text-sm text-amber-700">{cycleInfo.testing}</p>
            </div>
          </div>
          
          <div className="border-t border-amber-200 pt-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={data.wantsCycleReminders}
                onCheckedChange={handleReminderToggle}
              />
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Send me daily reminders to track my cycle</span>
              </div>
            </div>
            <p className="text-sm text-amber-700 mt-2 ml-6">
              We'll remind you to test water parameters and check your progress
            </p>
          </div>
        </CardContent>
      </Card>

      {data.experienceLevel === 'beginner' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-green-800">Beginner Tip</p>
                <p className="text-sm text-green-700 mt-1">
                  Don't skip the cycling process! It's the most important step for a healthy aquarium. 
                  Be patient - rushing this step is the #1 cause of fish loss in new tanks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
