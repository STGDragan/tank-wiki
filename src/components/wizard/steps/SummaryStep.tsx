
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WizardStepProps } from "../types";
import { ChevronLeft, CheckCircle, Circle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/hooks/use-toast";

interface SummaryStepProps extends WizardStepProps {
  aquariumCount: number;
  onClose: () => void;
}

export function SummaryStep({ data, aquariumCount, onClose, onPrev }: SummaryStepProps) {
  const [aquariumName, setAquariumName] = useState(`My ${data.tankGoal} Tank`);
  const { user, hasActiveSubscription } = useAuth();
  const queryClient = useQueryClient();

  const milestones = [
    { id: 'tank_placed', label: 'Tank placed in ideal location' },
    { id: 'equipment_installed', label: 'Equipment installed' },
    { id: 'substrate_added', label: 'Substrate added' },
    { id: 'decorations_added', label: 'Decorations and hardscape added' },
    { id: 'water_added', label: 'Water added and conditioned' },
    { id: 'cycle_started', label: 'Cycle started' },
    { id: 'cycle_completed', label: 'Tank fully cycled' },
    { id: 'cleanup_crew_added', label: 'Clean-up crew added' },
    { id: 'first_fish_added', label: 'First fish added' },
    { id: 'tank_established', label: 'Tank fully established' }
  ];

  const createAquariumMutation = useMutation({
    mutationFn: async (aquariumData: any) => {
      // Create the aquarium first
      const { data: newAquarium, error: aquariumError } = await supabase
        .from('aquariums')
        .insert([{
          name: aquariumData.name,
          type: aquariumData.type,
          size: aquariumData.size,
          user_id: aquariumData.user_id,
        }])
        .select()
        .single();
      
      if (aquariumError) throw new Error(aquariumError.message);

      // Save wizard progress data
      const { error: progressError } = await supabase
        .from('aquarium_wizard_progress')
        .insert([{
          aquarium_id: newAquarium.id,
          user_id: aquariumData.user_id,
          wizard_data: data,
          completed_steps: [],
        }]);

      if (progressError) throw new Error(progressError.message);

      return newAquarium;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      toast({ 
        title: 'Aquarium created successfully!',
        description: 'Your setup guide has been saved. Track your progress in the aquarium details.'
      });
      onClose();
    },
    onError: (err: Error) => {
      toast({ 
        title: 'Error creating aquarium', 
        description: err.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleCreateAquarium = () => {
    if (!hasActiveSubscription && aquariumCount >= 2) {
      toast({
        title: "Upgrade Required",
        description: "Free users can create up to 2 aquariums. Upgrade to Pro for unlimited aquariums.",
        variant: "destructive"
      });
      return;
    }

    const aquariumData = {
      name: aquariumName,
      type: data.tankGoal,
      size: data.tankSize,
      user_id: user?.id,
    };

    createAquariumMutation.mutate(aquariumData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 dark:text-slate-100">Setup Summary</h2>
        <p className="text-muted-foreground dark:text-slate-400">Review your selections and create your aquarium</p>
      </div>

      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Aquarium Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="aquarium-name" className="dark:text-slate-200">Aquarium Name</Label>
            <Input
              id="aquarium-name"
              value={aquariumName}
              onChange={(e) => setAquariumName(e.target.value)}
              className="mt-1 dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium dark:text-slate-200">Type</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">{data.tankGoal}</p>
            </div>
            <div>
              <p className="font-medium dark:text-slate-200">Size</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">{data.tankSize} gallons ({data.tankShape})</p>
            </div>
            <div>
              <p className="font-medium dark:text-slate-200">Experience Level</p>
              <Badge variant="outline" className="dark:border-slate-600 dark:text-slate-300">{data.experienceLevel}</Badge>
            </div>
            <div>
              <p className="font-medium dark:text-slate-200">Species Selected</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">{data.selectedSpecies.length} species</p>
            </div>
          </div>

          {data.selectedSpecies.length > 0 && (
            <div>
              <p className="font-medium mb-2 dark:text-slate-200">Selected Species</p>
              <div className="flex flex-wrap gap-2">
                {data.selectedSpecies.map(species => (
                  <Badge key={species} variant="secondary" className="dark:bg-slate-700 dark:text-slate-300">{species}</Badge>
                ))}
              </div>
            </div>
          )}

          {data.equipment.length > 0 && (
            <div>
              <p className="font-medium mb-2 dark:text-slate-200">Planned Equipment ({data.equipment.length} items)</p>
              <div className="flex flex-wrap gap-2">
                {data.equipment.slice(0, 5).map(equipment => (
                  <Badge key={equipment} variant="outline" className="dark:border-slate-600 dark:text-slate-300">{equipment}</Badge>
                ))}
                {data.equipment.length > 5 && (
                  <Badge variant="outline" className="dark:border-slate-600 dark:text-slate-300">+{data.equipment.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Setup Progress Tracker</CardTitle>
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            These milestones will be added to your aquarium profile for progress tracking
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground dark:text-slate-400 mb-2">
              <span>Progress</span>
              <span>0 of {milestones.length} completed</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-3">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm dark:text-slate-300">{milestone.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.wantsCycleReminders && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Cycle Reminders Enabled</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">You'll receive daily reminders to test your water parameters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="dark:border-slate-600">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleCreateAquarium}
          disabled={createAquariumMutation.isPending || !aquariumName.trim()}
          className="min-w-32"
        >
          {createAquariumMutation.isPending ? 'Creating...' : 'Create Aquarium'}
        </Button>
      </div>
    </div>
  );
}
