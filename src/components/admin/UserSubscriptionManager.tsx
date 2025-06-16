
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Crown, Users, Gift } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  full_name?: string;
  admin_subscription_override?: boolean;
}

interface AdminGrantedSubscription {
  id: string;
  granted_to_user_id: string;
  subscription_tier: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  notes?: string;
  profiles?: {
    full_name?: string;
  };
}

const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, admin_subscription_override')
    .order('full_name');

  if (error) throw error;
  return data || [];
};

const fetchGrantedSubscriptions = async (): Promise<AdminGrantedSubscription[]> => {
  const { data, error } = await supabase
    .from('admin_granted_subscriptions')
    .select(`
      *,
      profiles!granted_to_user_id (full_name)
    `)
    .order('granted_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export function UserSubscriptionManager() {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("Pro");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: fetchProfiles,
  });

  const { data: grantedSubscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['admin-granted-subscriptions'],
    queryFn: fetchGrantedSubscriptions,
  });

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

  const grantSubscriptionMutation = useMutation({
    mutationFn: async ({
      userId,
      tier,
      expires,
      notes: grantNotes,
    }: {
      userId: string;
      tier: string;
      expires?: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('admin_granted_subscriptions')
        .insert({
          granted_to_user_id: userId,
          subscription_tier: tier,
          expires_at: expires || null,
          notes: grantNotes || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Free subscription granted successfully" });
      setSelectedUserId("");
      setExpiresAt("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ['admin-granted-subscriptions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error granting subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const handleGrantSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    grantSubscriptionMutation.mutate({
      userId: selectedUserId,
      tier: subscriptionTier,
      expires: expiresAt || undefined,
      notes,
    });
  };

  if (profilesLoading || subscriptionsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Admin Override Section */}
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
            {profiles?.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{profile.full_name || 'Unnamed User'}</p>
                  <p className="text-sm text-muted-foreground">{profile.id}</p>
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grant Free Subscription Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Grant Free Subscription
          </CardTitle>
          <CardDescription>
            Grant temporary or permanent free subscriptions to specific users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGrantSubscription} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || 'Unnamed User'} ({profile.id.slice(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier-select">Subscription Tier</Label>
              <Select value={subscriptionTier} onValueChange={setSubscriptionTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires-input">Expires At (optional)</Label>
              <Input
                id="expires-input"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                placeholder="Leave empty for permanent access"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes-input">Notes (optional)</Label>
              <Textarea
                id="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for granting free subscription..."
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedUserId || grantSubscriptionMutation.isPending}
            >
              {grantSubscriptionMutation.isPending ? "Granting..." : "Grant Subscription"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Granted Subscriptions List */}
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
                    {subscription.profiles?.full_name || 'Unnamed User'}
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
                    Granted: {format(new Date(subscription.granted_at), "MMM d, yyyy")}
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
    </div>
  );
}
