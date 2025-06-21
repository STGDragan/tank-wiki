
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/hooks/use-toast';

export interface UserPreferences {
  id?: string;
  user_id: string;
  units_volume: 'gallons' | 'liters';
  created_at?: string;
  updated_at?: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          units_volume: 'gallons' as const,
        };
        
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default preferences:', insertError);
        } else {
          setPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error('Error in fetchPreferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error updating preferences',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setPreferences(data);
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been saved.',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const convertVolume = (value: number, from: 'gallons' | 'liters', to: 'gallons' | 'liters'): number => {
    if (from === to) return value;
    
    if (from === 'gallons' && to === 'liters') {
      return value * 3.78541;
    } else if (from === 'liters' && to === 'gallons') {
      return value / 3.78541;
    }
    
    return value;
  };

  const formatVolume = (value: number, unit?: 'gallons' | 'liters'): string => {
    const displayUnit = unit || preferences?.units_volume || 'gallons';
    const suffix = displayUnit === 'gallons' ? 'gal' : 'L';
    return `${value.toFixed(1)} ${suffix}`;
  };

  return {
    preferences,
    loading,
    updatePreferences,
    convertVolume,
    formatVolume,
  };
};
