import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Clock } from "lucide-react";
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
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  granted_by_profile?: {
    id: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface ActiveSubscriptionsTableProps {
  grantedSubscriptions?: AdminGrantedSubscription[];
}

export function ActiveSubscriptionsTable({ grantedSubscriptions }: ActiveSubscriptionsTableProps) {
  const queryClient = useQueryClient();

  // Filter for only active subscriptions
  const activeSubscriptions = grantedSubscriptions?.filter(sub => sub.is_active) || [];

  const revokeSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      console.log('Revoking subscription:', subscriptionId);
      const { error } = await supabase
        .from('admin_granted_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error revoking subscription:', error);
        throw error;
      }
      console.log('Subscription revoked successfully');
    },
    onSuccess: () => {
      console.log('Revoke mutation successful, invalidating queries');
      toast({ title: "Subscription revoked successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-granted-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
    onError: (error: Error) => {
      console.error('Revoke mutation error:', error);
      toast({
        title: "Error revoking subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getUserDisplayName = (profile?: { full_name?: string; first_name?: string; last_name?: string; email?: string }, userId?: string) => {
    if (!profile) {
      return `User ID: ${userId?.slice(0, 8)}...` || 'Unknown User';
    }
    
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
    return `User ID: ${userId?.slice(0, 8)}...` || 'Unknown User';
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          Active Subscriptions ({activeSubscriptions.length})
        </CardTitle>
        <CardDescription>
          Currently active granted subscriptions with management options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSubscriptions.map((subscription) => (
            <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-lg">
                    {getUserDisplayName(subscription.granted_to_profile, subscription.granted_to_user_id)}
                  </p>
                  {subscription.expires_at && isExpiringSoon(subscription.expires_at) && (
                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                      <Clock className="h-3 w-3 mr-1" />
                      Expires Soon
                    </Badge>
                  )}
                  {subscription.expires_at && isExpired(subscription.expires_at) && (
                    <Badge variant="destructive">
                      Expired
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="bg-green-600">
                    {subscription.subscription_tier}
                  </Badge>
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    Active
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium">Granted by:</span> {getUserDisplayName(subscription.granted_by_profile, subscription.granted_by_admin_id)}
                  </p>
                  <p>
                    <span className="font-medium">Date granted:</span> {format(new Date(subscription.granted_at), "MMM d, yyyy")}
                  </p>
                  {subscription.expires_at && (
                    <p>
                      <span className="font-medium">Expires:</span> {format(new Date(subscription.expires_at), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                
                {subscription.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium">Notes:</span> {subscription.notes}
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => revokeSubscriptionMutation.mutate(subscription.id)}
                  disabled={revokeSubscriptionMutation.isPending}
                >
                  {revokeSubscriptionMutation.isPending ? "Revoking..." : "Revoke"}
                </Button>
              </div>
            </div>
          ))}
          
          {activeSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No active subscriptions found.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Granted subscriptions will appear here once created.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}