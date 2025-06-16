
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShareAquariumDialogProps {
  aquariumId: string;
  aquariumName: string;
}

export function ShareAquariumDialog({ aquariumId, aquariumName }: ShareAquariumDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"viewer" | "editor">("viewer");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
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
        // If it's a duplicate key error, that's fine - invitation already exists
        if (!dbError.message.includes('duplicate key')) {
          throw new Error(dbError.message);
        }
        console.log("Invitation already exists, proceeding with email send...");
      } else {
        console.log("Invitation created in database successfully");
      }

      console.log("Now sending email...");

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
      setIsSuccess(true);
      setConfirmationMessage(`Invitation sent successfully to ${email}! They will receive an email with instructions to access your aquarium.`);
      setShowConfirmation(true);
      toast({
        title: "Invitation sent!",
        description: `An invitation email has been sent to ${email}`,
      });
      queryClient.invalidateQueries({ queryKey: ["aquarium_invitations", aquariumId] });
    },
    onError: (error: Error) => {
      console.error("Invitation error:", error);
      setIsSuccess(false);
      setConfirmationMessage(`Failed to send invitation: ${error.message}. Please try again or contact support if the problem persists.`);
      setShowConfirmation(true);
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

    setShowConfirmation(false);
    console.log("Submitting invitation for:", email.trim());
    sendInvitationMutation.mutate({ email: email.trim(), permission });
  };

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setShowConfirmation(false);
    setConfirmationMessage("");
    setIsSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      } else {
        setOpen(true);
      }
    }}>
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
        
        {showConfirmation && (
          <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {isSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={isSuccess ? "text-green-800" : "text-red-800"}>
              {confirmationMessage}
            </AlertDescription>
          </Alert>
        )}

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
            <Button type="button" variant="outline" onClick={handleClose}>
              {showConfirmation ? "Close" : "Cancel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
