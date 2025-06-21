
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
    { id: 'placed', label: 'Tank placed in ideal location', completed: false },
    { id: 'equipment', label: 'Equipment installed', completed: false },
    { id: 'substrate', label: 'Substrate added', completed: false },
    { id: 'water', label: 'Water added and conditioned', completed: false },
    { id: 'cycle', label: 'Cycle started', completed: false },
    { id: 'cycled', label: 'Tank fully cycled', completed: false },
    { id: 'cleanup', label: 'Clean-up crew added', completed: false },
    { id: 'fish', label: 'First fish added', completed: false }
  ];

  const createAquariumMutation = useMutation({
    mutationFn: async (aquariumData: any) => {
      const { data: newAquarium, error } = await supabase
        .from('aquariums')
        .insert([aquariumData])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return newAquarium;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      toast({ 
        title: 'Aquarium created successfully!',
        description: 'Your setup guide has been saved to the aquarium profile.'
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
      // Store wizard data as JSON in a metadata field (we'd need to add this column)
      // For now, we'll just create the basic aquarium
    };

    createAquariumMutation.mutate(aquariumData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Setup Summary</h2>
        <p className="text-muted-foreground">Review your selections and create your aquarium</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aquarium Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="aquarium-name">Aquarium Name</Label>
            <Input
              id="aquarium-name"
              value={aquariumName}
              onChange={(e) => setAquariumName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Type</p>
              <p className="text-sm text-muted-foreground">{data.tankGoal}</p>
            </div>
            <div>
              <p className="font-medium">Size</p>
              <p className="text-sm text-muted-foreground">{data.tankSize} gallons ({data.tankShape})</p>
            </div>
            <div>
              <p className="font-medium">Experience Level</p>
              <Badge variant="outline">{data.experienceLevel}</Badge>
            </div>
            <div>
              <p className="font-medium">Species Selected</p>
              <p className="text-sm text-muted-foreground">{data.selectedSpecies.length} species</p>
            </div>
          </div>

          {data.selectedSpecies.length > 0 && (
            <div>
              <p className="font-medium mb-2">Selected Species</p>
              <div className="flex flex-wrap gap-2">
                {data.selectedSpecies.map(species => (
                  <Badge key={species} variant="secondary">{species}</Badge>
                ))}
              </div>
            </div>
          )}

          {data.equipment.length > 0 && (
            <div>
              <p className="font-medium mb-2">Equipment List ({data.equipment.length} items)</p>
              <div className="flex flex-wrap gap-2">
                {data.equipment.slice(0, 5).map(equipment => (
                  <Badge key={equipment} variant="outline">{equipment}</Badge>
                ))}
                {data.equipment.length > 5 && (
                  <Badge variant="outline">+{data.equipment.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Progress Tracker</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your progress with these milestones (this will be added to your aquarium profile)
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>0 of {milestones.length} completed</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-3">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{milestone.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.wantsCycleReminders && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Cycle Reminders Enabled</p>
                <p className="text-sm text-blue-700">You'll receive daily reminders to test your water parameters</p>
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
