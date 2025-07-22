
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessibleTanks } from "@/components/sharing/AccessibleTanks";
import { SentInvitations } from "@/components/sharing/SentInvitations";
import { ProUpgradePrompt } from "@/components/wizard/ProUpgradePrompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Share2, Crown, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SharedWithMe = () => {
  const { user, loading: authLoading, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [aquariumCount, setAquariumCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load user's aquarium count for the upgrade prompt
  useEffect(() => {
    const loadAquariumCount = async () => {
      if (user) {
        const { data: aquariums } = await supabase
          .from('aquariums')
          .select('id')
          .eq('user_id', user.id);
        setAquariumCount(aquariums?.length || 0);
      }
    };
    loadAquariumCount();
  }, [user]);

  // Show upgrade prompt for non-subscribers
  useEffect(() => {
    if (!authLoading && !hasActiveSubscription) {
      setShowUpgradePrompt(true);
    }
  }, [authLoading, hasActiveSubscription]);

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

  // Show Pro upgrade page for non-subscribers
  if (!hasActiveSubscription) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <div className="container mx-auto px-4 py-12 space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tank Sharing & Collaboration
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Share your aquariums with family and friends, collaborate on tank management,
                and get help from other aquarists in your circle.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2">
                  Pro Feature
                </Badge>
                <Badge variant="outline" className="px-4 py-2 border-primary/50">
                  Collaboration Tools
                </Badge>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Sharing Features</h2>
                <p className="text-muted-foreground">Collaborate with others on your aquarium journey</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Share2 className="h-8 w-8 text-blue-500" />,
                    title: "Share Aquariums",
                    description: "Invite others to view and collaborate on your tank management",
                    examples: ["Send invite links", "Control permissions", "Real-time updates"]
                  },
                  {
                    icon: <Users className="h-8 w-8 text-green-500" />,
                    title: "Collaborative Management",
                    description: "Work together on maintenance, feeding, and monitoring",
                    examples: ["Shared task lists", "Multiple editors", "Activity tracking"]
                  },
                  {
                    icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
                    title: "Permission Control",
                    description: "Decide who can view or edit your aquarium data",
                    examples: ["View-only access", "Editor permissions", "Owner controls"]
                  }
                ].map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-primary/10">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        {feature.icon}
                        <Badge variant="outline" className="text-xs border-primary/30">
                          Pro
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-primary uppercase tracking-wide">Features:</h4>
                          <ul className="space-y-1">
                            {feature.examples.map((example, exampleIndex) => (
                              <li key={exampleIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6">
              <Card className="max-w-2xl mx-auto border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Ready to Start Sharing?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Upgrade to Pro to unlock tank sharing, collaboration tools, 
                    and work together with other aquarists.
                  </p>
                  <Button 
                    onClick={() => setShowUpgradePrompt(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold px-8 py-6"
                    size="lg"
                  >
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <ProUpgradePrompt 
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          aquariumCount={aquariumCount}
        />
      </>
    );
  }

  // Show actual shared tanks page for Pro subscribers
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">Shared Tanks</h1>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              Pro Feature
            </Badge>
          </div>
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
