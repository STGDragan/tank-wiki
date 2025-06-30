
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Fish, Calendar, Trash2, TestTube, Droplets, Filter, Wrench, ShoppingCart } from "lucide-react";
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

  const { data: latestWaterParameters } = useQuery({
    queryKey: ["latest-water-parameters", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("water_parameters")
        .select("*, aquariums(name)")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch data for tank health indicator
  const { data: tankHealthData } = useQuery({
    queryKey: ["tank-health-data", user?.id],
    queryFn: async () => {
      if (!user?.id || !aquariums[0]) return null;
      
      const aquariumId = aquariums[0].id;
      
      const [waterParams, maintenance, livestock, equipment] = await Promise.all([
        supabase.from("water_parameters").select("*").eq("aquarium_id", aquariumId).order("recorded_at", { ascending: false }).limit(5),
        supabase.from("maintenance").select("*").eq("aquarium_id", aquariumId),
        supabase.from("livestock").select("*").eq("aquarium_id", aquariumId),
        supabase.from("equipment").select("*").eq("aquarium_id", aquariumId)
      ]);

      return {
        waterParameters: waterParams.data || [],
        maintenance: maintenance.data || [],
        livestock: livestock.data || [],
        equipment: equipment.data || []
      };
    },
    enabled: !!user?.id && !!aquariums[0],
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

  const handleLogTest = () => {
    if (aquariums[0]) {
      navigate(`/aquarium/${aquariums[0].id}?tab=water`);
    } else {
      toast({
        title: "No Aquarium",
        description: "Please create an aquarium first to log water tests.",
        variant: "destructive",
      });
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const firstAquarium = aquariums[0];
  const latestWater = latestWaterParameters?.[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">TANKWIKI</h1>
        <div className="flex space-x-8">
          <button className="text-cyan-400 font-semibold">Dashboard</button>
          <button className="text-gray-400 hover:text-cyan-400">Livestock</button>
          <button className="text-gray-400 hover:text-cyan-400">Equipment</button>
        </div>
      </div>

      {/* Sponsorship Banner */}
      <SponsorshipBanner page="dashboard" />

      {/* Tank Health Indicator */}
      {firstAquarium && tankHealthData && (
        <div className="p-6">
          <TankHealthIndicator
            waterParameters={tankHealthData.waterParameters}
            maintenanceTasks={tankHealthData.maintenance}
            livestock={tankHealthData.livestock}
            equipment={tankHealthData.equipment}
            aquariumType={firstAquarium.type}
            aquariumSize={firstAquarium.size}
          />
        </div>
      )}

      {/* Quick Add Task Section */}
      {aquariums.length > 0 && (
        <div className="px-6 pb-6">
          <QuickAddTask aquariums={aquariums} />
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Aquarium */}
        <Card className="bg-gray-800 border-2 border-cyan-500/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">My Aquarium</CardTitle>
          </CardHeader>
          <CardContent>
            {firstAquarium ? (
              <div className="space-y-4">
                {firstAquarium.image_url && (
                  <div className="w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={firstAquarium.image_url}
                      alt={firstAquarium.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-white text-lg font-semibold">{firstAquarium.name}</h3>
                  <p className="text-gray-400">Started on {new Date(firstAquarium.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <Button
                  onClick={() => navigate(`/aquarium/${firstAquarium.id}`)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  View Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Fish className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2 text-white">No aquariums yet</h3>
                <p className="text-gray-400 mb-4">
                  Get started by creating your first aquarium
                </p>
                <AquariumSetupWizard aquariumCount={0} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water Tests */}
        <Card className="bg-gray-800 border-2 border-cyan-500/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">Water Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestWater ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                      <div className="text-gray-400 text-sm">Temperature</div>
                      <div className="text-white font-semibold">
                        {latestWater.temperature ? `${latestWater.temperature}°F` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                      <div className="text-gray-400 text-sm">pH</div>
                      <div className="text-white font-semibold">
                        {latestWater.ph || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                      <div className="text-gray-400 text-sm">Ammonia</div>
                      <div className="text-white font-semibold">
                        {latestWater.ammonia ? `${latestWater.ammonia} ppm` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                      <div className="text-gray-400 text-sm">Nitrate</div>
                      <div className="text-white font-semibold">
                        {latestWater.nitrate ? `${latestWater.nitrate} ppm` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                    onClick={handleLogTest}
                  >
                    LOG TEST
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400 mb-4">No water tests recorded yet</p>
                  <Button 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={handleLogTest}
                  >
                    Log First Test
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
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

        {/* Shopping */}
        <Card className="bg-gray-800 border-2 border-cyan-500/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">Shopping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-6 w-6 text-cyan-400" />
                  <div>
                    <div className="text-white font-medium">Recommended Products</div>
                    <div className="text-gray-400 text-sm">Browse aquarium supplies</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/shopping')}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <span className="text-xl">›</span>
                </Button>
              </div>
              <Button 
                className="w-full bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                onClick={() => navigate('/shopping')}
              >
                BROWSE PRODUCTS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Products Section */}
      <div className="px-6 pb-6">
        <RecommendedProducts />
      </div>
    </div>
  );
};

export default Dashboard;
