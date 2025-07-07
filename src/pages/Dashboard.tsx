import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SponsorshipBanner } from "@/components/sponsorship/SponsorshipBanner";
import { QuickAddTask } from "@/components/dashboard/QuickAddTask";
import { RecommendedProducts } from "@/components/dashboard/RecommendedProducts";
import { UpcomingMaintenanceTracker } from "@/components/dashboard/UpcomingMaintenanceTracker";
import { AquariumCard } from "@/components/dashboard/AquariumCard";
import { AquariumEmptyState } from "@/components/dashboard/AquariumEmptyState";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: aquariums = [], isLoading: aquariumsLoading } = useQuery({
    queryKey: ["aquariums", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("aquariums")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: upcomingTasks = [] } = useQuery({
    queryKey: ["upcoming-maintenance", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("maintenance")
        .select("*, aquariums(name)")
        .eq("user_id", user.id)
        .is("completed_date", null)
        .gte("due_date", new Date().toISOString().split('T')[0])
        .lte("due_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch data for tank health indicator for each aquarium
  const { data: tankHealthData } = useQuery({
    queryKey: ["tank-health-data", user?.id, aquariums.map(a => a.id)],
    queryFn: async () => {
      if (!user?.id || !aquariums.length) return {};
      
      const healthData = {};
      
      for (const aquarium of aquariums) {
        const [waterParams, maintenance, livestock, equipment] = await Promise.all([
          supabase.from("water_parameters").select("*").eq("aquarium_id", aquarium.id).order("recorded_at", { ascending: false }).limit(5),
          supabase.from("maintenance").select("*").eq("aquarium_id", aquarium.id),
          supabase.from("livestock").select("*").eq("aquarium_id", aquarium.id),
          supabase.from("equipment").select("*").eq("aquarium_id", aquarium.id)
        ]);

        healthData[aquarium.id] = {
          waterParameters: waterParams.data || [],
          maintenance: maintenance.data || [],
          livestock: livestock.data || [],
          equipment: equipment.data || []
        };
      }
      
      return healthData;
    },
    enabled: !!user?.id && !!aquariums.length,
  });

  const deleteAquariumMutation = useMutation({
    mutationFn: async (aquariumId: string) => {
      const { error } = await supabase
        .from("aquariums")
        .delete()
        .eq("id", aquariumId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aquariums"] });
      toast({
        title: "Aquarium deleted",
        description: "Your aquarium has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete aquarium. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAquarium = (aquariumId: string) => {
    if (window.confirm("Are you sure you want to delete this aquarium? This action cannot be undone.")) {
      deleteAquariumMutation.mutate(aquariumId);
    }
  };


  if (aquariumsLoading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Sponsorship Banner */}
      <SponsorshipBanner page="dashboard" />

      <div className="p-6 space-y-6">
        {/* My Aquariums Section - Always at the top */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">My Aquariums</h2>
          {aquariums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aquariums.map((aquarium) => (
                <AquariumCard
                  key={aquarium.id}
                  aquarium={aquarium}
                  tankHealthData={tankHealthData?.[aquarium.id]}
                  onDelete={handleDeleteAquarium}
                />
              ))}
            </div>
          ) : (
            <AquariumEmptyState />
          )}
        </div>

        {/* Quick Add Section - Full Width */}
        {aquariums.length > 0 && (
          <div className="w-full">
            <QuickAddTask aquariums={aquariums} />
          </div>
        )}

        {/* Upcoming Maintenance Section - Full Width */}
        {aquariums.length > 0 && (
          <div className="w-full">
            <UpcomingMaintenanceTracker aquariums={aquariums} />
          </div>
        )}

        {/* Recommended Products Section */}
        <div>
          <RecommendedProducts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
