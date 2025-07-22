
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessibleTanks } from "@/components/sharing/AccessibleTanks";
import { SentInvitations } from "@/components/sharing/SentInvitations";

const SharedWithMe = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <div className="space-y-8 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 bg-muted" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 w-full bg-muted" />
            <Skeleton className="h-48 w-full bg-muted" />
            <Skeleton className="h-48 w-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Shared Tanks</h1>
        </div>
        
        <Tabs defaultValue="accessible" className="space-y-6">
          <TabsList className="bg-muted backdrop-blur-sm border border-border">
            <TabsTrigger 
              value="accessible" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground"
            >
              Tanks I Can Access
            </TabsTrigger>
            <TabsTrigger 
              value="invitations" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground"
            >
              My Sent Invitations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="accessible">
            <AccessibleTanks />
          </TabsContent>
          
          <TabsContent value="invitations">
            <SentInvitations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SharedWithMe;
