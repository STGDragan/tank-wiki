
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const profileFormSchema = z.object({
  full_name: z.string().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Account = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Tables<'profiles'> | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') { // Ignore error for no rows found
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!user,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        full_name: "",
    },
    disabled: isLoading,
  });

  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loadingAdminStatus, setLoadingAdminStatus] = useState(true);
  const isAdmin = roles?.includes('admin');

  useEffect(() => {
    if (profile) {
      form.reset({ full_name: profile.full_name || "" });
    }
  }, [profile, form]);
  
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

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
        if (!user) throw new Error("User not found");
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: values.full_name, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    },
  });

  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
        if (!user) throw new Error("User not found");
        const { error } = await supabase
          .from('profiles')
          .update({ enable_maintenance_notifications: enabled, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Notification settings updated." });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      toast({ title: "Error updating settings", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input value={user?.email || ''} disabled />
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your email notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Switch
                id="maintenance-notifications"
                checked={profile?.enable_maintenance_notifications ?? true}
                onCheckedChange={(checked) => updateNotificationSettingsMutation.mutate(checked)}
                disabled={updateNotificationSettingsMutation.isPending || isLoading}
            />
            <Label htmlFor="maintenance-notifications" className="cursor-pointer">
                Receive maintenance reminder emails
            </Label>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default Account;
