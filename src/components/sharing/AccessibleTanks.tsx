
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SharedTankCard } from "@/components/dashboard/SharedTankCard";
import { Tables } from "@/integrations/supabase/types";
import { useAquariums } from "@/hooks/useAquariums";

type Profile = Tables<'profiles'>;

const fetchProfiles = async (): Promise<Profile[]> => {
    const { data, error } = await supabase.from('profiles').select('id, full_name');
    if (error) throw new Error(error.message);
    return (data as Profile[]) || [];
};

export function AccessibleTanks() {
  const { user } = useAuth();
  const { data: aquariums, isLoading: aquariumsLoading } = useAquariums(!!user);
  const { data: profiles, isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    enabled: !!user,
  });

  const isLoading = aquariumsLoading || profilesLoading;

  if (isLoading) {
    return (
      <div className="bg-gray-800 border-2 border-cyan-500/50 rounded-lg p-6">
        <div className="text-white">Loading accessible tanks...</div>
      </div>
    );
  }
  
  const sharedAquariums = aquariums?.filter(aq => aq.user_id !== user?.id) || [];
  
  const getOwnerName = (ownerId: string) => {
      const profile = profiles?.find(p => p.id === ownerId);
      return profile?.full_name || 'Unknown Owner';
  }

  if (sharedAquariums.length === 0) {
    return (
      <Card className="bg-gray-800 border-2 border-cyan-500/50">
        <CardHeader>
          <CardTitle className="text-white">Tanks Shared With You</CardTitle>
          <CardDescription className="text-gray-400">No tanks have been shared with you yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-2 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white">Tanks Shared With You</CardTitle>
        <CardDescription className="text-gray-400">Aquariums that others have shared with you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </CardContent>
    </Card>
  );
}
