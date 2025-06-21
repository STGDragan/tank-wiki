
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
      // Clean up URL
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
      <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">Error: {error.message}</div>;
  }

  const ownedAquariums = aquariums?.filter(aq => aq.user_id === user?.id) || [];
  const aquariumCount = ownedAquariums.length;

  return (
    <div className="h-full w-full overflow-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="animate-fade-in">
          <WelcomeBanner aquariumCount={aquariumCount} />
        </div>
        
        <div className="w-full h-[200px] rounded-2xl overflow-hidden shadow-soft animate-slide-up">
          <SlideshowSection context="dashboard" />
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
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
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <QuickAddTask aquariums={ownedAquariums.map(aq => ({ id: aq.id, name: aq.name, type: aq.type }))} />
            <Recommendations aquariums={ownedAquariums} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
