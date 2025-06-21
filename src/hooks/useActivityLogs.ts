
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/hooks/use-toast';

export interface ActivityLog {
  id: string;
  user_id: string;
  aquarium_id: string;
  activity_type: 'water_change' | 'water_test' | 'filter_clean' | 'livestock_add' | 'equipment_install' | 'maintenance' | 'note';
  title: string;
  description?: string;
  data?: Record<string, any>;
  image_url?: string;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export const useActivityLogs = (aquariumId?: string) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && aquariumId) {
      fetchLogs();
    }
  }, [user, aquariumId]);

  const fetchLogs = async () => {
    if (!user || !aquariumId) return;

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .order('logged_at', { ascending: false });

      if (error) {
        console.error('Error fetching activity logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error in fetchLogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logData: Omit<ActivityLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          ...logData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error logging activity',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setLogs(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        toast({
          title: 'Error deleting log',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setLogs(prev => prev.filter(log => log.id !== logId));
      toast({
        title: 'Log deleted',
        description: 'Activity log has been removed.',
      });
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  return {
    logs,
    loading,
    addLog,
    deleteLog,
    refetch: fetchLogs,
  };
};
