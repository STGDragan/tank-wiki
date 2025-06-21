
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const profilesWithEmails = profilesData?.map(profile => {
        const authUser = users?.find(user => user.id === profile.id);
        return {
          ...profile,
          email: authUser?.email
        };
      }) || [];

      return profilesWithEmails;
    },
  });

  const { data: grantedSubscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['admin-granted-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_granted_subscriptions')
        .select(`
          *,
          granted_to_profile:profiles!granted_to_user_id(id, full_name),
          granted_by_profile:profiles!granted_by_admin_id(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get auth user emails for granted subscriptions
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Add email information to granted subscriptions
      const subscriptionsWithEmails = data?.map(subscription => {
        const grantedToUser = users?.find(user => user.id === subscription.granted_to_user_id);
        const grantedByUser = users?.find(user => user.id === subscription.granted_by_admin_id);
        
        return {
          ...subscription,
          granted_to_email: grantedToUser?.email,
          granted_by_email: grantedByUser?.email
        };
      }) || [];

      return subscriptionsWithEmails;
    },
  });

  return {
    profiles,
    grantedSubscriptions,
    isLoading: profilesLoading || subscriptionsLoading
  };
}
