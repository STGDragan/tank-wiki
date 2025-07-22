import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { XCircle, RotateCcw } from "lucide-react";
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

interface RevokedSubscriptionsTableProps {
  grantedSubscriptions?: AdminGrantedSubscription[];
}

export function RevokedSubscriptionsTable({ grantedSubscriptions }: RevokedSubscriptionsTableProps) {
  const queryClient = useQueryClient();

  // Filter for only revoked subscriptions
  const revokedSubscriptions = grantedSubscriptions?.filter(sub => !sub.is_active) || [];

  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      console.log('Reactivating subscription:', subscriptionId);
      const { error } = await supabase
        .from('admin_granted_subscriptions')
        .update({ is_active: true })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error reactivating subscription:', error);
        throw error;
      }
      console.log('Subscription reactivated successfully');
    },
    onSuccess: () => {
      console.log('Reactivate mutation successful, invalidating queries');
      toast({ title: "Subscription reactivated successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-granted-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
    onError: (error: Error) => {
      console.error('Reactivate mutation error:', error);
      toast({
        title: "Error reactivating subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      console.log('Deleting subscription:', subscriptionId);
      const { error } = await supabase
        .from('admin_granted_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error deleting subscription:', error);
        throw error;
      }
      console.log('Subscription deleted successfully');
    },
    onSuccess: () => {
      console.log('Delete mutation successful, invalidating queries');
      toast({ title: "Subscription deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-granted-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
    onError: (error: Error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error deleting subscription",
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

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <XCircle className="h-5 w-5" />
          Revoked Subscriptions ({revokedSubscriptions.length})
        </CardTitle>
        <CardDescription>
          Previously active subscriptions that have been revoked or expired.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {revokedSubscriptions.map((subscription) => (
            <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg bg-white opacity-75">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-lg">
                    {getUserDisplayName(subscription.granted_to_profile, subscription.granted_to_user_id)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {subscription.subscription_tier}
                  </Badge>
                  <Badge variant="destructive">
                    Revoked
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium">Originally granted by:</span> {getUserDisplayName(subscription.granted_by_profile, subscription.granted_by_admin_id)}
                  </p>
                  <p>
                    <span className="font-medium">Date granted:</span> {format(new Date(subscription.granted_at), "MMM d, yyyy")}
                  </p>
                  {subscription.expires_at && (
                    <p>
                      <span className="font-medium">Was set to expire:</span> {format(new Date(subscription.expires_at), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                
                {subscription.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium">Notes:</span> {subscription.notes}
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reactivateSubscriptionMutation.mutate(subscription.id)}
                  disabled={reactivateSubscriptionMutation.isPending}
                  className="border-green-500 text-green-700 hover:bg-green-50"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {reactivateSubscriptionMutation.isPending ? "Reactivating..." : "Reactivate"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSubscriptionMutation.mutate(subscription.id)}
                  disabled={deleteSubscriptionMutation.isPending}
                  className="text-red-600 hover:bg-red-50"
                >
                  {deleteSubscriptionMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
          
          {revokedSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No revoked subscriptions found.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Revoked subscriptions will appear here for management.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}