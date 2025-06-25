
import { CreateTankDialog } from "@/components/dashboard/CreateTankDialog";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickAddTask } from "@/components/dashboard/QuickAddTask";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { toast } from "@/hooks/use-toast";
import { SlideshowSection } from "@/components/landing/SlideshowSection";
import { useAquariums, Aquarium } from "@/hooks/useAquariums";
import { AquariumGroups } from "@/components/dashboard/AquariumGroups";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { EmptyState } from "@/components/dashboard/EmptyState";

const Dashboard = () => {
  const { user, loading: authLoading, refreshSubscriber } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('subscription_success') === 'true') {
      toast({
        title: "Subscription Successful!",
        description: "Welcome to Pro! You can now add up to 10 aquariums.",
      });
      refreshSubscriber();
      searchParams.delete('subscription_success');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, refreshSubscriber, setSearchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const { data: aquariums, isLoading, error } = useAquariums(!!user);

  const deleteAquariumMutation = useMutation({
    mutationFn: async (aquariumId: string) => {
      const { error } = await supabase.from('aquariums').delete().eq('id', aquariumId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      toast({ title: 'Aquarium deleted successfully!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error deleting aquarium', description: err.message, variant: 'destructive' });
    }
  });

  const handleDeleteAquarium = (aquariumId: string) => {
    deleteAquariumMutation.mutate(aquariumId);
  };

  if (authLoading || (isLoading && !aquariums)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48 rounded-sm bg-muted/50" />
            <Skeleton className="h-10 w-28 rounded-sm bg-muted/50" />
          </div>
          <div className="cyber-grid">
            <Skeleton className="h-48 w-full rounded-sm bg-muted/50" />
            <Skeleton className="h-48 w-full rounded-sm bg-muted/50" />
            <Skeleton className="h-48 w-full rounded-sm bg-muted/50" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-destructive font-mono text-center py-12">
            <div className="cyber-card p-8 max-w-md mx-auto">
              <h2 className="font-display text-xl mb-2">SYSTEM ERROR</h2>
              <p className="text-muted-foreground">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ownedAquariums = aquariums?.filter(aq => aq.user_id === user?.id) || [];
  const aquariumCount = ownedAquariums.length;

  return (
    <div className="min-h-screen bg-background mobile-nav-space">
      <div className="h-full w-full overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="animate-slide-in">
            <WelcomeBanner aquariumCount={aquariumCount} />
          </div>
          
          <div className="w-full h-[200px] glass-panel neon-border overflow-hidden shadow-cyber animate-slide-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <SlideshowSection context="dashboard" />
          </div>
          
          <div className="animate-slide-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            {aquariumCount === 0 ? (
              <EmptyState aquariumCount={aquariumCount} />
            ) : (
              <AquariumGroups 
                aquariums={ownedAquariums}
                onDeleteAquarium={handleDeleteAquarium}
                aquariumCount={aquariumCount}
              />
            )}
          </div>
          
          {ownedAquariums && ownedAquariums.length > 0 && (
            <div className="space-y-6 animate-slide-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <QuickAddTask aquariums={ownedAquariums.map(aq => ({ id: aq.id, name: aq.name, type: aq.type, size: aq.size }))} />
              <Recommendations aquariums={ownedAquariums} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
