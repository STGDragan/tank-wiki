
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Settings = () => {
  const { user, roles, refreshRoles } = useAuth();
  const { toast } = useToast();

  const handleClaimAdmin = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase.rpc('claim_admin_role');

    if (error) {
      toast({ title: "Error claiming admin role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: data });
      await refreshRoles();
    }
  };

  const isAdmin = roles?.includes('admin');

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Role</CardTitle>
          <CardDescription>
            {isAdmin 
              ? "You already have the admin role." 
              : "Claim the admin role to manage products and other site settings. This can only be done by the first user."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdmin && (
            <Button onClick={handleClaimAdmin}>Claim Admin Role</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
