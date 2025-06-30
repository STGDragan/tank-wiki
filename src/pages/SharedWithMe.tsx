
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
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="space-y-8 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 bg-gray-800" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 w-full bg-gray-800" />
            <Skeleton className="h-48 w-full bg-gray-800" />
            <Skeleton className="h-48 w-full bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Shared Tanks</h1>
        </div>
        
        <Tabs defaultValue="accessible" className="space-y-6">
          <TabsList className="bg-gray-800 backdrop-blur-sm border border-gray-600">
            <TabsTrigger 
              value="accessible" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300 hover:text-white"
            >
              Tanks I Can Access
            </TabsTrigger>
            <TabsTrigger 
              value="invitations" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300 hover:text-white"
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
