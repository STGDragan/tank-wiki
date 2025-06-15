
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";
import { SharedTankCard } from "@/components/dashboard/SharedTankCard";
import { useAquariums } from "@/hooks/useAquariums";

type Profile = Tables<'profiles'>;

const fetchProfiles = async (): Promise<Profile[]> => {
    const { data, error } = await supabase.from('profiles').select('id, full_name');
    if (error) throw new Error(error.message);
    return (data as Profile[]) || [];
};

const SharedWithMe = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const { data: aquariums, isLoading: aquariumsLoading, error: aquariumsError } = useAquariums(!!user);

  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    enabled: !!user,
  });

  const isLoading = authLoading || (aquariumsLoading && !aquariums) || profilesLoading;

  if (isLoading) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
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

  const error = aquariumsError || profilesError;
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  const sharedAquariums = aquariums?.filter(aq => aq.user_id !== user?.id) || [];
  
  const getOwnerName = (ownerId: string) => {
      const profile = profiles?.find(p => p.id === ownerId);
      return profile?.full_name || 'Unknown Owner';
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shared With Me</h1>
      </div>
      {sharedAquariums && sharedAquariums.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sharedAquariums.map(tank => (
            <SharedTankCard 
              key={tank.id} 
              id={tank.id} 
              name={tank.name} 
              type={tank.type || 'N/A'} 
              size={tank.size || 0} 
              image_url={tank.image_url}
              ownerName={getOwnerName(tank.user_id)}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Aquariums Shared With You</h2>
          <p className="text-muted-foreground mt-2">When a friend shares an aquarium with you, it will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;
