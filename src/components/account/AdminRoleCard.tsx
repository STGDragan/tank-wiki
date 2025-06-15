
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export const AdminRoleCard = () => {
  const { roles } = useAuth();
  const { toast } = useToast();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loadingAdminStatus, setLoadingAdminStatus] = useState(true);
  const isAdmin = roles?.includes('admin');

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAdmin) {
        setLoadingAdminStatus(true);
        const { data, error } = await supabase.rpc('admin_role_exists');

        if (error) {
          toast({ title: "Error checking admin status", description: error.message, variant: "destructive" });
          setAdminExists(null);
        } else {
          setAdminExists(data);
        }
        setLoadingAdminStatus(false);
      } else {
        setLoadingAdminStatus(false);
      }
    };

    checkAdminStatus();
  }, [isAdmin, toast]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Role</CardTitle>
        <CardDescription>
          {isAdmin
            ? "You already have the admin role."
            : loadingAdminStatus
              ? "Checking admin status..."
              : adminExists === true
                ? "An administrator has already been configured for this application."
                : adminExists === false
                  ? "No administrator has been configured for this application. An admin must be assigned manually via the Supabase dashboard."
                  : "Could not determine admin status."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* The button to claim admin role has been removed to enhance security. */}
      </CardContent>
    </Card>
  );
};
