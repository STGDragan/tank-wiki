
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Aquarium = Pick<Tables<'aquariums'>, 'id' | 'name'>;

interface QuickAddTaskProps {
  aquariums: Aquarium[];
}

const commonTasks = ['Water Change', 'Water Test', 'Clean Filter', 'Add Inhabitants'];

export function QuickAddTask({ aquariums }: QuickAddTaskProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAquariumId, setSelectedAquariumId] = useState<string>('');
  const navigate = useNavigate();

  const addTaskMutation = useMutation({
    mutationFn: async ({ task }: { task: string }) => {
      if (!user || !selectedAquariumId) {
        throw new Error("User or aquarium not selected.");
      }
      const { error } = await supabase.from("maintenance").insert({
        aquarium_id: selectedAquariumId,
        user_id: user.id,
        task: task,
        due_date: new Date().toISOString().split('T')[0], // Today's date
      });

      if (error) throw error;
    },
    onSuccess: (_, { task }) => {
      toast({
        title: "Task Added!",
        description: `"${task}" has been added to the schedule.`,
      });
      queryClient.invalidateQueries({ queryKey: ['maintenance', selectedAquariumId] });
      if (selectedAquariumId) {
        navigate(`/aquarium/${selectedAquariumId}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Tasks</CardTitle>
        <CardDescription>Quickly add a common maintenance task to one of your aquariums.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={setSelectedAquariumId} value={selectedAquariumId}>
          <SelectTrigger>
            <SelectValue placeholder="Select an aquarium..." />
          </SelectTrigger>
          <SelectContent>
            {aquariums.map((aq) => (
              <SelectItem key={aq.id} value={aq.id}>{aq.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {commonTasks.map((task) => (
                <Button 
                    key={task}
                    variant="outline"
                    disabled={!selectedAquariumId || addTaskMutation.isPending}
                    onClick={() => addTaskMutation.mutate({ task })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {task}
                </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
