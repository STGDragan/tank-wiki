
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Crown } from "lucide-react";

interface Profile {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  admin_subscription_override?: boolean;
}

interface AdminOverrideSectionProps {
  profiles?: Profile[];
}

export function AdminOverrideSection({ profiles }: AdminOverrideSectionProps) {
  const queryClient = useQueryClient();

  const toggleAdminOverrideMutation = useMutation({
    mutationFn: async ({ userId, override }: { userId: string; override: boolean }) => {
      console.log('Toggling admin override for user:', userId, 'to:', override);
      const { error } = await supabase
        .from('profiles')
        .update({ admin_subscription_override: override })
        .eq('id', userId);

      if (error) {
        console.error('Error updating admin override:', error);
        throw error;
      }
      console.log('Admin override updated successfully');
    },
    onSuccess: () => {
      console.log('Override mutation successful, invalidating queries');
      toast({ title: "Admin override updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-granted-subscriptions'] });
    },
    onError: (error: Error) => {
      console.error('Override mutation error:', error);
      toast({
        title: "Error updating admin override",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatUserDisplay = (profile: Profile) => {
    // Prioritize first_name + last_name, then full_name, then email
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      return profile.first_name;
    } else if (profile.last_name) {
      return profile.last_name;
    } else if (profile.full_name) {
      return profile.full_name;
    }
    if (profile.email) {
      return profile.email;
    }
    return `User ID: ${profile.id.slice(0, 8)}...`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Admin Subscription Overrides
        </CardTitle>
        <CardDescription>
          Toggle subscription access for users without affecting their actual payment status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profiles?.map((profile) => {
            const displayName = formatUserDisplay(profile);
            const showEmail = profile.email && (profile.first_name || profile.last_name || profile.full_name);
            
            return (
              <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{displayName}</p>
                  {showEmail && (
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`override-${profile.id}`}>Override Active</Label>
                  <Switch
                    id={`override-${profile.id}`}
                    checked={profile.admin_subscription_override || false}
                    onCheckedChange={(checked) =>
                      toggleAdminOverrideMutation.mutate({
                        userId: profile.id,
                        override: checked,
                      })
                    }
                    disabled={toggleAdminOverrideMutation.isPending}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
