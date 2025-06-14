import { TankCard } from "@/components/dashboard/TankCard";
import { CreateTankDialog } from "@/components/dashboard/CreateTankDialog";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";
import { QuickAddTask } from "@/components/dashboard/QuickAddTask";

type Aquarium = Tables<'aquariums'> & { image_url?: string | null };

const fetchAquariums = async (): Promise<Aquarium[]> => {
    const { data, error } = await supabase.from('aquariums').select('*');
    if (error) throw new Error(error.message);
    return (data as Aquarium[]) || [];
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const { data: aquariums, isLoading, error } = useQuery<Aquarium[]>({
    queryKey: ['aquariums'],
    queryFn: fetchAquariums,
    enabled: !!user,
  });

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <CreateTankDialog />
      </div>
      {aquariums && aquariums.length > 0 ? (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {aquariums.map(tank => (
              <TankCard key={tank.id} id={tank.id} name={tank.name} type={tank.type || 'N/A'} size={tank.size || 0} image_url={tank.image_url} />
            ))}
          </div>
          <QuickAddTask aquariums={aquariums.map(aq => ({ id: aq.id, name: aq.name }))} />
        </div>
      ) : (
         <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Aquariums Yet</h2>
          <p className="text-muted-foreground mt-2">Get started by creating your first tank.</p>
          <div className="mt-4">
            <CreateTankDialog />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
