
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Fish, Calendar, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AquariumSetupWizard } from "@/components/wizard/AquariumSetupWizard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecommendedProducts } from "@/components/dashboard/RecommendedProducts";
import { SystemHealthBar } from "@/components/dashboard/SystemHealthBar";
import { toast } from "@/hooks/use-toast";

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
        .lte("due_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
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
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Your Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Manage your aquarium journey with ease
        </p>
      </div>

      {/* My Aquariums - moved above system health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Fish className="h-5 w-5" />
              My Aquariums ({aquariums.length})
            </CardTitle>
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
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {aquariums.slice(0, 6).map((aquarium) => (
                <Card
                  key={aquarium.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group relative"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAquarium(aquarium.id);
                    }}
                    className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardContent 
                    className="p-6"
                    onClick={() => navigate(`/aquarium/${aquarium.id}`)}
                  >
                    <div className="space-y-4">
                      {aquarium.image_url && (
                        <div className="w-full h-48 rounded-lg overflow-hidden">
                          <img
                            src={aquarium.image_url}
                            alt={aquarium.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{aquarium.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {aquarium.type} • {aquarium.size} gallons
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {aquariums.length > 6 && (
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

      {/* System Health Bar */}
      <SystemHealthBar />

      {/* Quick Actions - 2x2 grid */}
      <QuickActions />

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{task.task}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.aquariums?.name} • Due {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingTasks.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{upcomingTasks.length - 5} more tasks
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No upcoming tasks</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Products */}
      <RecommendedProducts />
    </div>
  );
};

export default Dashboard;
