
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

interface ShareAquariumDialogProps {
  aquariumId: string;
  aquariumName: string;
}

export function ShareAquariumDialog({ aquariumId, aquariumName }: ShareAquariumDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"viewer" | "editor">("viewer");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendInvitationMutation = useMutation({
    mutationFn: async ({ email, permission }: { email: string; permission: "viewer" | "editor" }) => {
      if (!user) throw new Error("User not authenticated");

      console.log("Starting invitation process for:", email);

      // First, create the invitation in the database
      const { error: dbError } = await supabase
        .from("aquarium_share_invitations")
        .insert({
          aquarium_id: aquariumId,
          owner_user_id: user.id,
          invited_email: email,
          permission,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(dbError.message);
      }

      console.log("Invitation created in database, now sending email...");

      // Then, send the email invitation using the Supabase client
      const { data, error } = await supabase.functions.invoke('send-aquarium-invitation', {
        body: {
          aquariumId,
          invitedEmail: email,
          permission,
          aquariumName,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || 'Failed to send invitation email');
      }

      console.log("Email sent successfully:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent!",
        description: `An invitation email has been sent to ${email}`,
      });
      setEmail("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["aquarium_invitations", aquariumId] });
    },
    onError: (error: Error) => {
      console.error("Invitation error:", error);
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    console.log("Submitting invitation for:", email.trim());
    sendInvitationMutation.mutate({ email: email.trim(), permission });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{aquariumName}"</DialogTitle>
          <DialogDescription>
            Send an email invitation to share your aquarium with someone else.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permission">Permission level</Label>
            <Select value={permission} onValueChange={(value) => setPermission(value as "viewer" | "editor")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer - Can view only</SelectItem>
                <SelectItem value="editor">Editor - Can view and edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={sendInvitationMutation.isPending}
              className="flex-1"
            >
              {sendInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
