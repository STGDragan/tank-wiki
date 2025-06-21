
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import { format } from "date-fns";

interface AdminGrantedSubscription {
  id: string;
  granted_to_user_id: string;
  granted_by_admin_id: string;
  subscription_tier: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  notes?: string;
  granted_to_profile?: {
    id: string;
    full_name?: string;
  };
  granted_by_profile?: {
    id: string;
    full_name?: string;
  };
}

interface GrantedSubscriptionsListProps {
  grantedSubscriptions?: AdminGrantedSubscription[];
}

export function GrantedSubscriptionsList({ grantedSubscriptions }: GrantedSubscriptionsListProps) {
  const queryClient = useQueryClient();

  const revokeSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('admin_granted_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Subscription revoked successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-granted-subscriptions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error revoking subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getUserDisplayName = (profile?: { full_name?: string }, userId?: string) => {
    return profile?.full_name || `User ID: ${userId?.slice(0, 8)}...` || 'Unknown User';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Granted Subscriptions
        </CardTitle>
        <CardDescription>
          Manage previously granted free subscriptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {grantedSubscriptions?.map((subscription) => (
            <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">
                  {getUserDisplayName(subscription.granted_to_profile, subscription.granted_to_user_id)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={subscription.is_active ? "default" : "secondary"}>
                    {subscription.subscription_tier}
                  </Badge>
                  <Badge variant={subscription.is_active ? "outline" : "destructive"}>
                    {subscription.is_active ? "Active" : "Revoked"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Granted by: {getUserDisplayName(subscription.granted_by_profile, subscription.granted_by_admin_id)} • {format(new Date(subscription.granted_at), "MMM d, yyyy")}
                  {subscription.expires_at && (
                    <span> • Expires: {format(new Date(subscription.expires_at), "MMM d, yyyy")}</span>
                  )}
                </p>
                {subscription.notes && (
                  <p className="text-sm text-muted-foreground italic mt-1">
                    {subscription.notes}
                  </p>
                )}
              </div>
              {subscription.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeSubscriptionMutation.mutate(subscription.id)}
                  disabled={revokeSubscriptionMutation.isPending}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
          {(!grantedSubscriptions || grantedSubscriptions.length === 0) && (
            <p className="text-muted-foreground text-center py-8">
              No subscriptions have been granted yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
