import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface SubscriptionDowngrade {
  id: string;
  user_id: string;
  downgrade_date: string;
  previous_tier: string | null;
  reason: string | null;
  aquarium_limit: number;
  migration_required: boolean;
  migration_completed: boolean;
  selected_aquarium_ids: string[] | null;
}

export const useSubscriptionDowngrade = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check for pending downgrade requiring migration
  const { data: pendingDowngrade, isLoading } = useQuery({
    queryKey: ['subscription-downgrade', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('subscription_downgrades')
        .select('*')
        .eq('user_id', user.id)
        .eq('migration_completed', false)
        .order('downgrade_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is okay
        throw error;
      }
      
      return data as SubscriptionDowngrade | null;
    },
    enabled: !!user?.id,
  });

  // Complete migration mutation
  const completeMigrationMutation = useMutation({
    mutationFn: async (selectedAquariumIds: string[]) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('complete_aquarium_migration', {
        p_user_id: user.id,
        p_selected_aquarium_ids: selectedAquariumIds
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-downgrade'] });
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      toast({
        title: 'Migration completed',
        description: 'Your selected aquariums have been preserved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Migration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Trigger downgrade function (for testing or manual triggers)
  const triggerDowngradeMutation = useMutation({
    mutationFn: async ({ 
      previousTier = null, 
      reason = 'payment_failed' 
    }: { 
      previousTier?: string | null; 
      reason?: string; 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('handle_subscription_downgrade', {
        p_user_id: user.id,
        p_previous_tier: previousTier,
        p_reason: reason
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-downgrade'] });
      toast({
        title: 'Subscription downgraded',
        description: 'Your account has been downgraded. Please select which aquariums to keep.',
        variant: 'destructive',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Downgrade failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    pendingDowngrade,
    isLoading,
    completeMigration: completeMigrationMutation.mutate,
    isCompletingMigration: completeMigrationMutation.isPending,
    triggerDowngrade: triggerDowngradeMutation.mutate,
    isTriggeringDowngrade: triggerDowngradeMutation.isPending,
  };
};