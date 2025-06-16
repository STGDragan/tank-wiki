
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

type TimelineEntry = Tables<'aquarium_timeline'>;

const fetchTimelineEntries = async (aquariumId: string): Promise<TimelineEntry[]> => {
  const { data, error } = await supabase
    .from("aquarium_timeline")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("entry_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const useTimelineData = (aquariumId: string | undefined, userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: timelineEntries, isLoading, error } = useQuery({
    queryKey: ['timeline', aquariumId],
    queryFn: () => fetchTimelineEntries(aquariumId!),
    enabled: !!aquariumId && !!userId,
  });

  const addTimelineEntryMutation = useMutation({
    mutationFn: async (entry: TablesInsert<'aquarium_timeline'>) => {
      const { error } = await supabase
        .from('aquarium_timeline')
        .insert(entry);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', aquariumId] });
      toast({ title: 'Timeline entry added successfully!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding timeline entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTimelineEntryMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimelineEntry> & { id: string }) => {
      const { error } = await supabase
        .from('aquarium_timeline')
        .update(updates)
        .eq('id', id);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', aquariumId] });
      toast({ title: 'Timeline entry updated successfully!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating timeline entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTimelineEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('aquarium_timeline')
        .delete()
        .eq('id', entryId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', aquariumId] });
      toast({ title: 'Timeline entry deleted successfully!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting timeline entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    timelineEntries,
    isLoading,
    error,
    addTimelineEntry: addTimelineEntryMutation.mutate,
    updateTimelineEntry: updateTimelineEntryMutation.mutate,
    deleteTimelineEntry: deleteTimelineEntryMutation.mutate,
    isAddingEntry: addTimelineEntryMutation.isPending,
    isUpdatingEntry: updateTimelineEntryMutation.isPending,
    isDeletingEntry: deleteTimelineEntryMutation.isPending,
  };
};
