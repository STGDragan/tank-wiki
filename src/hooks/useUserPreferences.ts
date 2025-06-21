
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
    } else {
      setPreferences(null);
      setLoading(false);
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
        setLoading(false);
        return;
      }

      if (data) {
        const typedPrefs: UserPreferences = {
          ...data,
          units_volume: data.units_volume as 'gallons' | 'liters'
        };
        setPreferences(typedPrefs);
      } else {
        // Only create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error in fetchPreferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    const defaultPrefs = {
      user_id: user.id,
      units_volume: 'gallons' as const,
    };
    
    try {
      const { data: newPrefs, error: insertError } = await supabase
        .from('user_preferences')
        .insert(defaultPrefs)
        .select()
        .single();

      if (insertError) {
        // If it's a duplicate key error, try to fetch the existing record
        if (insertError.code === '23505') {
          console.log('Preferences already exist, fetching existing record');
          const { data: existingPrefs, error: fetchError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!fetchError && existingPrefs) {
            const typedExistingPrefs: UserPreferences = {
              ...existingPrefs,
              units_volume: existingPrefs.units_volume as 'gallons' | 'liters'
            };
            setPreferences(typedExistingPrefs);
          }
        } else {
          console.error('Error creating default preferences:', insertError);
        }
      } else if (newPrefs) {
        const typedNewPrefs: UserPreferences = {
          ...newPrefs,
          units_volume: newPrefs.units_volume as 'gallons' | 'liters'
        };
        setPreferences(typedNewPrefs);
      }
    } catch (error) {
      console.error('Error in createDefaultPreferences:', error);
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

      const typedData: UserPreferences = {
        ...data,
        units_volume: data.units_volume as 'gallons' | 'liters'
      };
      setPreferences(typedData);
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
