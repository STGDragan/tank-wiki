
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TestTube } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { AddWaterParameterForm } from "./AddWaterParameterForm";
import { WaterParameterCard } from "./WaterParameterCard";
import { Skeleton } from "@/components/ui/skeleton";

type WaterParameterReading = Tables<'water_parameters'>;

interface WaterParametersSectionProps {
  aquariumId: string;
  aquariumType?: string | null;
  latestReading?: WaterParameterReading;
}

const fetchWaterParameters = async (aquariumId: string): Promise<WaterParameterReading[]> => {
  const { data, error } = await supabase
    .from('water_parameters')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('recorded_at', { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return data || [];
};

export function WaterParametersSection({ 
  aquariumId, 
  aquariumType, 
  latestReading 
}: WaterParametersSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: waterParameters, isLoading, error } = useQuery({
    queryKey: ['water_parameters', aquariumId],
    queryFn: () => fetchWaterParameters(aquariumId),
    enabled: !!aquariumId && !!user,
  });

  const deleteParameterMutation = useMutation({
    mutationFn: async (parameterId: string) => {
      const { error } = await supabase.from('water_parameters').delete().eq('id', parameterId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water_parameters', aquariumId] });
      toast({ title: 'Success', description: 'Water parameter reading deleted successfully.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const handleDelete = (parameterId: string) => {
    if (window.confirm('Are you sure you want to delete this water parameter reading?')) {
      deleteParameterMutation.mutate(parameterId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Water Parameters</CardTitle>
            <p className="text-sm text-muted-foreground">Track and monitor your water quality</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Water Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl">Water Parameters</CardTitle>
          <p className="text-sm text-muted-foreground">Track and monitor your water quality</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <TestTube className="mr-2 h-4 w-4" />
                Add Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Add Water Parameter Reading</DialogTitle>
                <DialogDescription>
                  Record your latest water test results. Values from your most recent test are pre-filled but fully editable.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <AddWaterParameterForm 
                  aquariumId={aquariumId}
                  aquariumType={aquariumType}
                  onSuccess={() => setIsAddDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {waterParameters && waterParameters.length > 0 ? (
          <div className="grid gap-4">
            {waterParameters.map((reading) => (
              <WaterParameterCard 
                key={reading.id} 
                reading={reading} 
                aquariumType={aquariumType}
                onDelete={() => handleDelete(reading.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TestTube className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No water tests recorded</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start tracking your water quality by adding your first test results.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Add First Test
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
