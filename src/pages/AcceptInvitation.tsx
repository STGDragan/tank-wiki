
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ success: boolean; error?: string; aquarium_id?: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!token) {
      setResult({ success: false, error: "Invalid invitation link" });
      setLoading(false);
      return;
    }

    acceptInvitation();
  }, [user, authLoading, token, navigate]);

  const acceptInvitation = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase.rpc('accept_aquarium_invitation', {
        _invitation_token: token
      });

      if (error) throw error;

      const response = data as { success: boolean; error?: string; aquarium_id?: string };
      setResult(response);
    } catch (error: any) {
      setResult({ success: false, error: error.message || "Failed to accept invitation" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Processing invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {result?.success ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle>
            {result?.success ? "Invitation Accepted!" : "Invitation Error"}
          </CardTitle>
          <CardDescription>
            {result?.success 
              ? "You now have access to this aquarium."
              : result?.error || "There was a problem with your invitation."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {result?.success && result.aquarium_id ? (
              <Button 
                onClick={() => navigate(`/aquarium/${result.aquarium_id}`)}
                className="flex-1"
              >
                View Aquarium
              </Button>
            ) : null}
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
