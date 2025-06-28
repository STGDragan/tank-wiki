
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Fish, Droplets, Calendar, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AquariumSetupWizard } from "@/components/wizard/AquariumSetupWizard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecommendedProducts } from "@/components/dashboard/RecommendedProducts";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        .lte("due_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (aquariumsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Your Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Manage your aquarium journey with ease
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aquariums</CardTitle>
            <Fish className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aquariums.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Parameters</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Aquariums */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Aquariums */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Aquariums</CardTitle>
                <div className="flex gap-2">
                  <AquariumSetupWizard aquariumCount={aquariums.length} />
                  <Button onClick={() => navigate("/aquariums/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Aquarium
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {aquariums.length > 0 ? (
                <div className="grid gap-4">
                  {aquariums.slice(0, 3).map((aquarium) => (
                    <Card
                      key={aquarium.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/aquarium/${aquarium.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {aquarium.image_url && (
                            <img
                              src={aquarium.image_url}
                              alt={aquarium.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold">{aquarium.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {aquarium.type} • {aquarium.size} gallons
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {aquariums.length > 3 && (
                    <Button variant="outline" onClick={() => navigate("/aquariums")}>
                      View All Aquariums ({aquariums.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Fish className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No aquariums yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first aquarium
                  </p>
                  <AquariumSetupWizard aquariumCount={0} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Products */}
          <RecommendedProducts />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Upcoming Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded border">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.task}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.aquariums?.name} • Due {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No upcoming tasks</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
