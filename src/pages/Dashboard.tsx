
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Fish, Calendar, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AquariumSetupWizard } from "@/components/wizard/AquariumSetupWizard";
import { toast } from "@/hooks/use-toast";
import { SponsorshipBanner } from "@/components/sponsorship/SponsorshipBanner";
import { TankHealthIndicator } from "@/components/aquarium/TankHealthIndicator";
import { QuickAddTask } from "@/components/dashboard/QuickAddTask";
import { RecommendedProducts } from "@/components/dashboard/RecommendedProducts";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleAddTask = () => {
    if (aquariums[0]) {
      navigate(`/aquarium/${aquariums[0].id}?tab=maintenance`);
    } else {
      toast({
        title: "No Aquarium",
        description: "Please create an aquarium first to add maintenance tasks.",
        variant: "destructive",
      });
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
                <Card key={aquarium.id} className="bg-gray-800 border-2 border-cyan-500/50 rounded-xl">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg">{aquarium.name}</CardTitle>
                        <p className="text-gray-400 text-sm">
                          Started on {new Date(aquarium.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAquarium(aquarium.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tank Health Indicator integrated into each aquarium */}
                    {tankHealthData?.[aquarium.id] && (
                      <TankHealthIndicator
                        waterParameters={tankHealthData[aquarium.id].waterParameters}
                        maintenanceTasks={tankHealthData[aquarium.id].maintenance}
                        livestock={tankHealthData[aquarium.id].livestock}
                        equipment={tankHealthData[aquarium.id].equipment}
                        aquariumType={aquarium.type}
                        aquariumSize={aquarium.size}
                        compact={true}
                      />
                    )}
                    
                    {aquarium.image_url && (
                      <div className="w-full h-32 rounded-lg overflow-hidden">
                        <img
                          src={aquarium.image_url}
                          alt={aquarium.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <Button
                      onClick={() => navigate(`/aquarium/${aquarium.id}`)}
                      className="w-full bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800 border-2 border-cyan-500/50 rounded-xl">
              <CardContent className="text-center py-8">
                <Fish className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2 text-white">No aquariums yet</h3>
                <p className="text-gray-400 mb-4">
                  Get started by creating your first aquarium
                </p>
                <AquariumSetupWizard aquariumCount={0} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Add Section - Full Width */}
        {aquariums.length > 0 && (
          <div className="w-full">
            <QuickAddTask aquariums={aquariums} />
          </div>
        )}

        {/* Maintenance Section - Full Width */}
        <div className="w-full">
          <Card className="bg-gray-800 border-2 border-cyan-500/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white text-xl">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.length > 0 ? (
                  <>
                    {upcomingTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                        <div>
                          <div className="text-white font-medium">{task.task}</div>
                          <div className="text-gray-400 text-sm">{task.aquariums?.name}</div>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {task.due_date === new Date().toISOString().split('T')[0] ? 'Today' : 
                           task.due_date === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? 'Tomorrow' :
                           new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                    <Button 
                      className="w-full bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                      onClick={handleAddTask}
                    >
                      ADD TASK
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400 mb-4">No upcoming maintenance tasks</p>
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      onClick={handleAddTask}
                    >
                      Add Task
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Products Section */}
        <div>
          <RecommendedProducts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
