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
      <div className="min-h-screen bg-gray-900 flex">
        {/* Left Navigation */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-6">
          <div className="text-2xl font-bold text-cyan-400 mb-8">TANKWIKI</div>
          <nav className="space-y-4">
            <div className="text-cyan-400 font-semibold">Dashboard</div>
            <div className="text-gray-400 hover:text-cyan-400 cursor-pointer">Livestock</div>
            <div className="text-gray-400 hover:text-cyan-400 cursor-pointer">Equipment</div>
            <div className="text-gray-400 hover:text-cyan-400 cursor-pointer">Knowledge Base</div>
            <div className="text-gray-400 hover:text-cyan-400 cursor-pointer">Shopping</div>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const latestWater = latestWaterParameters?.[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Navigation */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6">
        <div className="text-2xl font-bold text-cyan-400 mb-8">TANKWIKI</div>
        <nav className="space-y-4">
          <div className="text-cyan-400 font-semibold">Dashboard</div>
          <div 
            className="text-gray-400 hover:text-cyan-400 cursor-pointer"
            onClick={() => navigate('/knowledge-base')}
          >
            Knowledge Base
          </div>
          <div 
            className="text-gray-400 hover:text-cyan-400 cursor-pointer"
            onClick={() => navigate('/shopping')}
          >
            Shopping
          </div>
          <div 
            className="text-gray-400 hover:text-cyan-400 cursor-pointer"
            onClick={() => navigate('/shared-with-me')}
          >
            Shared Tanks
          </div>
          <div 
            className="text-gray-400 hover:text-cyan-400 cursor-pointer"
            onClick={() => navigate('/account')}
          >
            Account
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
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
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
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

          {/* Quick Add and Water Tests side by side under My Aquariums */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Add Task Section */}
            {aquariums.length > 0 && (
              <QuickAddTask aquariums={aquariums} />
            )}

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
          </div>

          {/* Other sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div>
            <RecommendedProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
