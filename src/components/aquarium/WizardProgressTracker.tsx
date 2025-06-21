
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Settings, Fish, CheckCircle, Circle } from "lucide-react";
import { useWizardData } from "@/hooks/useWizardData";
import { AquariumSetupWizard } from "@/components/wizard/AquariumSetupWizard";

interface WizardProgressTrackerProps {
  aquariumId: string;
  userId: string;
  aquariumCount: number;
}

export function WizardProgressTracker({ aquariumId, userId, aquariumCount }: WizardProgressTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { wizardProgress, updateCompletedSteps } = useWizardData(aquariumId, userId);

  const milestones = [
    { id: 'tank_placed', label: 'Tank placed in ideal location', category: 'setup' },
    { id: 'equipment_installed', label: 'Equipment installed', category: 'setup' },
    { id: 'substrate_added', label: 'Substrate added', category: 'setup' },
    { id: 'decorations_added', label: 'Decorations and hardscape added', category: 'setup' },
    { id: 'water_added', label: 'Water added and conditioned', category: 'setup' },
    { id: 'cycle_started', label: 'Cycle started', category: 'cycling' },
    { id: 'cycle_completed', label: 'Tank fully cycled (ammonia & nitrite = 0)', category: 'cycling' },
    { id: 'cleanup_crew_added', label: 'Clean-up crew added', category: 'stocking' },
    { id: 'first_fish_added', label: 'First fish added', category: 'stocking' },
    { id: 'tank_established', label: 'Tank fully established', category: 'stocking' }
  ];

  const completedSteps = wizardProgress?.completed_steps || [];
  const completedCount = completedSteps.length;
  const progressPercentage = (completedCount / milestones.length) * 100;

  const handleStepToggle = (stepId: string, checked: boolean) => {
    let newCompletedSteps;
    if (checked) {
      newCompletedSteps = [...completedSteps, stepId];
    } else {
      newCompletedSteps = completedSteps.filter(id => id !== stepId);
    }
    updateCompletedSteps(newCompletedSteps);
  };

  const groupedMilestones = {
    setup: milestones.filter(m => m.category === 'setup'),
    cycling: milestones.filter(m => m.category === 'cycling'),
    stocking: milestones.filter(m => m.category === 'stocking'),
  };

  if (!wizardProgress) {
    return (
      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Setup Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground dark:text-slate-400 mb-4">
              No setup wizard data found for this aquarium.
            </p>
            <AquariumSetupWizard aquariumCount={aquariumCount} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-slate-800/50 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Setup Progress ({completedCount}/{milestones.length})
          </CardTitle>
          <div className="flex gap-2">
            <AquariumSetupWizard aquariumCount={aquariumCount} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="dark:border-slate-600"
            >
              View Details
              {isExpanded ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground dark:text-slate-400">
            <span>{Math.round(progressPercentage)}% Complete</span>
            <span>{completedCount} of {milestones.length} steps</span>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Wizard Selections Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Original Wizard Selections</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Tank Goal:</span>
                  <p className="text-blue-600 dark:text-blue-400">{wizardProgress.wizard_data.tankGoal}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Size & Shape:</span>
                  <p className="text-blue-600 dark:text-blue-400">{wizardProgress.wizard_data.tankSize} gallons ({wizardProgress.wizard_data.tankShape})</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Experience Level:</span>
                  <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300">
                    {wizardProgress.wizard_data.experienceLevel}
                  </Badge>
                </div>
                {wizardProgress.wizard_data.selectedSpecies.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-700 dark:text-blue-300">Selected Species:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {wizardProgress.wizard_data.selectedSpecies.slice(0, 3).map(species => (
                        <Badge key={species} variant="secondary" className="text-xs">
                          {species}
                        </Badge>
                      ))}
                      {wizardProgress.wizard_data.selectedSpecies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{wizardProgress.wizard_data.selectedSpecies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Categories */}
            {Object.entries(groupedMilestones).map(([category, steps]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium capitalize text-lg dark:text-slate-200">
                  {category === 'setup' && '🔧 '}{category === 'cycling' && '🔄 '}{category === 'stocking' && '🐠 '}
                  {category} Phase
                </h4>
                <div className="space-y-2">
                  {steps.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded-lg dark:border-slate-600">
                      <Checkbox
                        checked={completedSteps.includes(milestone.id)}
                        onCheckedChange={(checked) => handleStepToggle(milestone.id, checked as boolean)}
                      />
                      {completedSteps.includes(milestone.id) ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={`flex-1 ${completedSteps.includes(milestone.id) ? 'line-through text-muted-foreground' : 'dark:text-slate-200'}`}>
                        {milestone.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
