
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { WizardData } from "@/components/wizard/types";

interface WizardProgress {
  id: string;
  aquarium_id: string;
  user_id: string;
  wizard_data: WizardData;
  completed_steps: string[];
  created_at: string;
  updated_at: string;
}

export const useWizardData = (aquariumId: string | undefined, userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: wizardProgress, isLoading } = useQuery({
    queryKey: ['wizard_progress', aquariumId],
    queryFn: async () => {
      if (!aquariumId || !userId) return null;
      
      const { data, error } = await supabase
        .from('aquarium_wizard_progress')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      
      return data as WizardProgress | null;
    },
    enabled: !!aquariumId && !!userId,
  });

  const saveWizardDataMutation = useMutation({
    mutationFn: async ({ wizardData, completedSteps = [] }: { wizardData: WizardData; completedSteps?: string[] }) => {
      if (!aquariumId || !userId) throw new Error('Missing required data');

      const progressData = {
        aquarium_id: aquariumId,
        user_id: userId,
        wizard_data: wizardData,
        completed_steps: completedSteps,
      };

      const { data, error } = await supabase
        .from('aquarium_wizard_progress')
        .upsert(progressData)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wizard_progress', aquariumId] });
      toast({ title: 'Wizard progress saved!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error saving progress', description: err.message, variant: 'destructive' });
    }
  });

  const updateCompletedStepsMutation = useMutation({
    mutationFn: async (completedSteps: string[]) => {
      if (!aquariumId || !wizardProgress) throw new Error('Missing required data');

      const { data, error } = await supabase
        .from('aquarium_wizard_progress')
        .update({ completed_steps: completedSteps, updated_at: new Date().toISOString() })
        .eq('aquarium_id', aquariumId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wizard_progress', aquariumId] });
      toast({ title: 'Progress updated!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error updating progress', description: err.message, variant: 'destructive' });
    }
  });

  return {
    wizardProgress,
    isLoading,
    saveWizardData: saveWizardDataMutation.mutate,
    updateCompletedSteps: updateCompletedStepsMutation.mutate,
    isSaving: saveWizardDataMutation.isPending || updateCompletedStepsMutation.isPending,
  };
};
