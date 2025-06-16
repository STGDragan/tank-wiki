
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/providers/AuthProvider";

interface Invitation {
  id: string;
  invited_email: string;
  permission: "viewer" | "editor";
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  invitation_token: string;
  aquarium_id: string;
  aquariums: {
    name: string;
  };
}

const fetchSentInvitations = async (userId: string): Promise<Invitation[]> => {
  const { data, error } = await supabase
    .from("aquarium_share_invitations")
    .select(`
      *,
      aquariums (name)
    `)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export function SentInvitations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["sent_invitations", user?.id],
    queryFn: () => fetchSentInvitations(user!.id),
    enabled: !!user,
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("aquarium_share_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Invitation cancelled" });
      queryClient.invalidateQueries({ queryKey: ["sent_invitations", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/accept-invitation/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Invitation link copied to clipboard" });
  };

  if (isLoading) {
    return <div>Loading sent invitations...</div>;
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations</CardTitle>
          <CardDescription>No invitations sent yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent Invitations</CardTitle>
        <CardDescription>Manage aquarium sharing invitations you've sent.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{invitation.invited_email}</span>
                <Badge variant={invitation.permission === "editor" ? "default" : "secondary"}>
                  {invitation.permission}
                </Badge>
                {invitation.accepted_at ? (
                  <Badge variant="outline" className="text-green-600">
                    Accepted
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Pending
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {invitation.aquariums?.name} • Sent {format(new Date(invitation.created_at), "MMM d, yyyy")}
                {!invitation.accepted_at && (
                  <span> • Expires {format(new Date(invitation.expires_at), "MMM d, yyyy")}</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {!invitation.accepted_at && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteLink(invitation.invitation_token)}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                disabled={deleteInvitationMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
