
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  profile?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

type RoleType = "admin" | "user";

export function useAdminUserRoles() {
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-management-profiles'],
    queryFn: async () => {
      console.log('Fetching profiles for admin management...');
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, email')
        .order('first_name, last_name, full_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data:', profilesData);
      return profilesData as Profile[] || [];
    },
  });

  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role')
        .order('role');

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        return [];
      }

      const userIds = roles.map(role => role.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map((profilesData || []).map(profile => [profile.id, profile]));

      const rolesWithProfiles: UserRole[] = roles.map(role => ({
        id: role.id,
        user_id: role.user_id,
        role: role.role,
        profile: profilesMap.get(role.user_id) || undefined
      }));

      return rolesWithProfiles;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: RoleType }) => {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Role assigned successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error assigning role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Role removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    profiles,
    userRoles,
    isLoading: profilesLoading || rolesLoading,
    assignRoleMutation,
    removeRoleMutation
  };
}
