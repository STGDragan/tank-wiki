
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
  admin_subscription_override?: boolean;
}

interface AdminOverrideSectionProps {
  profiles?: Profile[];
}

export function AdminOverrideSection({ profiles }: AdminOverrideSectionProps) {
  const queryClient = useQueryClient();

  const toggleAdminOverrideMutation = useMutation({
    mutationFn: async ({ userId, override }: { userId: string; override: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ admin_subscription_override: override })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Admin override updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating admin override",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatUserDisplay = (profile: Profile) => {
    // Use full_name if available, otherwise use truncated ID
    const name = profile.full_name || `User ID: ${profile.id.slice(0, 8)}...`;
    
    return { name };
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
            const { name } = formatUserDisplay(profile);
            return (
              <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{name}</p>
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
