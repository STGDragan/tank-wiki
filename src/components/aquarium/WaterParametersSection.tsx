
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

  const addParameterMutation = useMutation({
    mutationFn: async (newParameter: Omit<WaterParameterReading, 'id' | 'created_at'>) => {
      if (!user) throw new Error("You must be logged in to add water parameters.");
      
      // Default missing critical values to 0
      const parameterWithDefaults = {
        ...newParameter,
        ammonia: newParameter.ammonia ?? 0,
        nitrite: newParameter.nitrite ?? 0,
        nitrate: newParameter.nitrate ?? 0,
        user_id: user.id,
        aquarium_id: aquariumId,
      };

      const { error } = await supabase.from('water_parameters').insert(parameterWithDefaults);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water_parameters', aquariumId] });
      toast({ title: 'Success', description: 'Water parameters added successfully.' });
      setIsAddDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const deleteParameterMutation = useMutation({
    mutationFn: async (parameterId: string) => {
      const { error } = await supabase.from('water_parameters').delete().eq('id', parameterId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water_parameters', aquariumId] });
      toast({ title: 'Success', description: 'Water parameters deleted.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Water Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Error loading water parameters: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TestTube className="h-6 w-6 text-blue-600" />
          Water Parameters
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Test Results
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Water Test Results</DialogTitle>
              <DialogDescription>
                Record your latest water test results. Missing values will default to 0 for tracking.
              </DialogDescription>
            </DialogHeader>
            <AddWaterParameterForm
              aquariumId={aquariumId}
              aquariumType={aquariumType}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      {waterParameters && waterParameters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {waterParameters.map((parameter) => (
            <WaterParameterCard
              key={parameter.id}
              reading={parameter}
              aquariumType={aquariumType}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No water tests recorded</h3>
            <p className="text-gray-600 mb-4">
              Start tracking your aquarium's water quality by adding your first test results.
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Water Test Results</DialogTitle>
                  <DialogDescription>
                    Record your latest water test results. Missing values will default to 0 for tracking.
                  </DialogDescription>
                </DialogHeader>
                <AddWaterParameterForm
                  aquariumId={aquariumId}
                  aquariumType={aquariumType}
                  onSuccess={handleFormSuccess}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
