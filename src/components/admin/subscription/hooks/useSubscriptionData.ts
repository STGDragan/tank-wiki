
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  full_name?: string;
  admin_subscription_override?: boolean;
}

interface AdminGrantedSubscription {
  id: string;
  granted_to_user_id: string;
  granted_by_admin_id: string;
  subscription_tier: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  notes?: string;
  user_profile?: {
    full_name?: string;
  };
}

const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, admin_subscription_override')
    .order('full_name');

  if (error) throw error;
  return data || [];
};

const fetchGrantedSubscriptions = async (): Promise<AdminGrantedSubscription[]> => {
  // First get the subscriptions
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('admin_granted_subscriptions')
    .select('*')
    .order('granted_at', { ascending: false });

  if (subscriptionsError) throw subscriptionsError;

  if (!subscriptions || subscriptions.length === 0) {
    return [];
  }

  // Then get the profiles for the granted users
  const userIds = subscriptions.map(sub => sub.granted_to_user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  // Combine the data
  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
  
  return subscriptions.map(subscription => ({
    ...subscription,
    user_profile: profilesMap.get(subscription.granted_to_user_id)
  }));
};

export function useSubscriptionData() {
  const profilesQuery = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: fetchProfiles,
  });

  const subscriptionsQuery = useQuery({
    queryKey: ['admin-granted-subscriptions'],
    queryFn: fetchGrantedSubscriptions,
  });

  return {
    profiles: profilesQuery.data,
    grantedSubscriptions: subscriptionsQuery.data,
    isLoading: profilesQuery.isLoading || subscriptionsQuery.isLoading,
  };
}
