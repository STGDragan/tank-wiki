
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Gift } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface Profile {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  admin_subscription_override?: boolean;
}

interface GrantSubscriptionSectionProps {
  profiles?: Profile[];
}

export function GrantSubscriptionSection({ profiles }: GrantSubscriptionSectionProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("Pro");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  console.log('GrantSubscriptionSection - profiles received:', profiles);

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
      if (!user?.id) {
        throw new Error("Admin user ID not found");
      }

      const { error } = await supabase
        .from('admin_granted_subscriptions')
        .insert({
          granted_to_user_id: userId,
          granted_by_admin_id: user.id,
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

  const formatUserDisplay = (profile: Profile) => {
    // Prioritize first_name + last_name, then full_name, then email, fallback to truncated ID
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name} (${profile.email || 'No email'})`;
    } else if (profile.first_name) {
      return `${profile.first_name} (${profile.email || 'No email'})`;
    } else if (profile.last_name) {
      return `${profile.last_name} (${profile.email || 'No email'})`;
    } else if (profile.full_name) {
      return `${profile.full_name} (${profile.email || 'No email'})`;
    } else if (profile.email) {
      return profile.email;
    }
    return `User ID: ${profile.id.slice(0, 8)}...`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Grant Free Subscription
        </CardTitle>
        <CardDescription>
          Grant temporary or permanent free subscriptions to specific users.
          {profiles && profiles.length === 0 && (
            <span className="block mt-2 text-amber-600">
              Note: No user profiles found. Users need to sign up and complete their profiles first.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!profiles ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No user profiles found. Users need to sign up and complete their profiles to appear here.
            </p>
          </div>
        ) : (
          <form onSubmit={handleGrantSubscription} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User ({profiles.length} available)</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {formatUserDisplay(profile)}
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
        )}
      </CardContent>
    </Card>
  );
}
