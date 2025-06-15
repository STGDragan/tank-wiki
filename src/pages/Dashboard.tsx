
import { TankCard } from "@/components/dashboard/TankCard";
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
        <div>
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-28" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const ownedAquariums = aquariums?.filter(aq => aq.user_id === user?.id) || [];
  const aquariumCount = ownedAquariums.length;

  return (
    <div className="space-y-8">
      <div className="w-full h-[250px] rounded-lg overflow-hidden">
        <SlideshowSection context="dashboard" />
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Aquariums</h1>
        <CreateTankDialog aquariumCount={aquariumCount} />
      </div>
      {ownedAquariums && ownedAquariums.length > 0 ? (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ownedAquariums.map(tank => (
              <TankCard key={tank.id} id={tank.id} name={tank.name} type={tank.type || 'N/A'} size={tank.size || 0} image_url={tank.image_url} onDelete={handleDeleteAquarium} />
            ))}
          </div>
          <QuickAddTask aquariums={ownedAquariums.map(aq => ({ id: aq.id, name: aq.name, type: aq.type }))} />
          <Recommendations aquariums={ownedAquariums} />
        </div>
      ) : (
         <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Aquariums Yet</h2>
          <p className="text-muted-foreground mt-2">Get started by creating your first tank.</p>
          <div className="mt-4">
            <CreateTankDialog aquariumCount={aquariumCount} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
