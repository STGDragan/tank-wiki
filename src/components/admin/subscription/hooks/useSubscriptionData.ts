
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileWithEmail {
  id: string;
  full_name?: string;
  email?: string;
  admin_subscription_override?: boolean;
}

interface GrantedSubscriptionWithProfiles {
  id: string;
  granted_to_user_id: string;
  granted_by_admin_id: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  subscription_tier: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  granted_to_profile?: {
    id: string;
    full_name?: string;
    email?: string;
  };
  granted_by_profile?: {
    id: string;
    full_name?: string;
    email?: string;
  };
}

export function useSubscriptionData() {
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      console.log('Fetching profiles for subscription data...');
      
      // Get profiles data with email column
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, admin_subscription_override')
        .order('full_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data:', profilesData);
      return profilesData as ProfileWithEmail[] || [];
    },
  });

  const { data: grantedSubscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['admin-granted-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_granted_subscriptions')
        .select(`
          id,
          granted_to_user_id,
          granted_by_admin_id,
          granted_at,
          expires_at,
          is_active,
          subscription_tier,
          notes,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      // Get all profile data for granted_to and granted_by users
      const userIds = [
        ...data.map(sub => sub.granted_to_user_id),
        ...data.map(sub => sub.granted_by_admin_id)
      ];
      
      const uniqueUserIds = Array.from(new Set(userIds));

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', uniqueUserIds);

      if (profilesError) throw profilesError;

      // Create profiles map for quick lookup
      const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));

      // Add profile information to granted subscriptions
      const subscriptionsWithProfiles: GrantedSubscriptionWithProfiles[] = data.map(subscription => {
        const grantedToProfile = profilesMap.get(subscription.granted_to_user_id);
        const grantedByProfile = profilesMap.get(subscription.granted_by_admin_id);
        
        return {
          ...subscription,
          granted_to_profile: grantedToProfile ? { 
            id: grantedToProfile.id, 
            full_name: grantedToProfile.full_name,
            email: grantedToProfile.email
          } : undefined,
          granted_by_profile: grantedByProfile ? { 
            id: grantedByProfile.id, 
            full_name: grantedByProfile.full_name,
            email: grantedByProfile.email
          } : undefined
        };
      });

      return subscriptionsWithProfiles;
    },
  });

  return {
    profiles,
    grantedSubscriptions,
    isLoading: profilesLoading || subscriptionsLoading
  };
}
