
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileWithEmail {
  id: string;
  full_name?: string;
  admin_subscription_override?: boolean;
  email?: string;
}

interface GrantedSubscriptionWithEmails {
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
  };
  granted_by_profile?: {
    id: string;
    full_name?: string;
  };
  granted_to_email?: string;
  granted_by_email?: string;
}

export function useSubscriptionData() {
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      // Get profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, admin_subscription_override')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Get auth user emails
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Combine profile and user data
      const profilesWithEmails: ProfileWithEmail[] = (profilesData || []).map(profile => {
        const authUser = (users || []).find(user => user.id === profile.id);
        return {
          ...profile,
          email: authUser?.email
        };
      });

      return profilesWithEmails;
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
        .select('id, full_name')
        .in('id', uniqueUserIds);

      if (profilesError) throw profilesError;

      // Get auth user emails
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Create profiles map for quick lookup
      const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));

      // Add email and profile information to granted subscriptions
      const subscriptionsWithEmails: GrantedSubscriptionWithEmails[] = data.map(subscription => {
        const grantedToProfile = profilesMap.get(subscription.granted_to_user_id);
        const grantedByProfile = profilesMap.get(subscription.granted_by_admin_id);
        const grantedToUser = (users || []).find(user => user.id === subscription.granted_to_user_id);
        const grantedByUser = (users || []).find(user => user.id === subscription.granted_by_admin_id);
        
        return {
          ...subscription,
          granted_to_profile: grantedToProfile,
          granted_by_profile: grantedByProfile,
          granted_to_email: grantedToUser?.email,
          granted_by_email: grantedByUser?.email
        };
      });

      return subscriptionsWithEmails;
    },
  });

  return {
    profiles,
    grantedSubscriptions,
    isLoading: profilesLoading || subscriptionsLoading
  };
}
