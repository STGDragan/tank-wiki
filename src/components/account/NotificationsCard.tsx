
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationsCardProps {
  profile: Tables<'profiles'> | null;
  isLoading: boolean;
}

export const NotificationsCard = ({ profile, isLoading }: NotificationsCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user) throw new Error("User not found");
      const { error } = await supabase
        .from('profiles')
        .update({ enable_maintenance_notifications: enabled, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Notification settings updated." });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      toast({ title: "Error updating settings", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your email notification preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Switch
            id="maintenance-notifications"
            checked={profile?.enable_maintenance_notifications ?? true}
            onCheckedChange={(checked) => updateNotificationSettingsMutation.mutate(checked)}
            disabled={updateNotificationSettingsMutation.isPending || isLoading}
          />
          <Label htmlFor="maintenance-notifications" className="cursor-pointer">
            Receive maintenance reminder emails
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
