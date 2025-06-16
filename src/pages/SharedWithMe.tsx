
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shared Tanks</h1>
      </div>
      
      <Tabs defaultValue="accessible" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accessible">Tanks I Can Access</TabsTrigger>
          <TabsTrigger value="invitations">My Sent Invitations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accessible">
          <AccessibleTanks />
        </TabsContent>
        
        <TabsContent value="invitations">
          <SentInvitations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedWithMe;
