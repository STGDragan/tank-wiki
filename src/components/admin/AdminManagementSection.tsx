
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Shield, Users } from "lucide-react";
import { useState } from "react";

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  profile?: {
    full_name?: string;
    email?: string;
  };
}

type RoleType = "admin" | "user";

export function AdminManagementSection() {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("user");
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-management-profiles'],
    queryFn: async () => {
      console.log('Fetching profiles for admin management...');
      
      // Get profiles with email data (email is already in the profiles table)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

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
        .select(`
          id,
          user_id,
          role,
          profiles!inner(id, full_name, email)
        `)
        .order('role');

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        return [];
      }

      // Transform the data to match our interface
      const rolesWithProfiles: UserRole[] = roles.map(role => ({
        id: role.id,
        user_id: role.user_id,
        role: role.role,
        profile: {
          full_name: role.profiles?.full_name,
          email: role.profiles?.email
        }
      }));

      return rolesWithProfiles;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: RoleType }) => {
      // First check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Role assigned successfully" });
      setSelectedUserId("");
      setSelectedRole("user");
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

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRole) return;
    assignRoleMutation.mutate({ userId: selectedUserId, role: selectedRole });
  };

  const formatUserDisplay = (profile: Profile) => {
    const name = profile.full_name || 'Unnamed User';
    const email = profile.email || 'No email';
    return `${name} (${email})`;
  };

  const isLoading = profilesLoading || rolesLoading;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Role Management
        </CardTitle>
        <CardDescription>
          Assign and manage admin roles for users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assign Role Section */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Assign Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User ({profiles?.length || 0} available)</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {formatUserDisplay(profile)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-select">Role</Label>
              <Select value={selectedRole} onValueChange={(value: RoleType) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAssignRole}
                disabled={!selectedUserId || assignRoleMutation.isPending}
                className="w-full"
              >
                {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </div>
        </div>

        {/* Current Roles Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Role Assignments
          </h3>
          <div className="space-y-3">
            {userRoles?.map((userRole) => (
              <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {userRole.profile?.full_name || 'Unnamed User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {userRole.profile?.email || 'No email'}
                    </p>
                  </div>
                  <Badge variant={userRole.role === 'admin' ? 'default' : 'secondary'}>
                    {userRole.role}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRoleMutation.mutate(userRole.id)}
                  disabled={removeRoleMutation.isPending}
                >
                  Remove
                </Button>
              </div>
            ))}
            {(!userRoles || userRoles.length === 0) && (
              <p className="text-muted-foreground text-center py-8">
                No role assignments found.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
