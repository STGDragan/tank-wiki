import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JournalTab from "@/components/aquarium/JournalTab";
import WishlistTab from "@/components/aquarium/WishlistTab";
import { HealthRanking } from "@/components/aquarium/HealthRanking";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { AquariumRecommendations } from "@/components/aquarium/AquariumRecommendations";
import { AquariumHeader } from "@/components/aquarium/AquariumHeader";
import { WaterParametersSection } from "@/components/aquarium/WaterParametersSection";
import { MaintenanceSection } from "@/components/aquarium/MaintenanceSection";
import { LivestockSection } from "@/components/aquarium/LivestockSection";
import { EquipmentSection } from "@/components/aquarium/EquipmentSection";

type Livestock = Tables<'livestock'> & { image_url?: string | null };
type Equipment = Tables<'equipment'> & { image_url?: string | null };
type WaterParameterReading = Tables<'water_parameters'> & {
  salinity?: number | null;
  alkalinity?: number | null;
  calcium?: number | null;
  magnesium?: number | null;
};
type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };
type Aquarium = Tables<'aquariums'> & { image_url?: string | null };

const fetchAquariumById = async (id: string) => {
  const { data, error } = await supabase
    .from("aquariums")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data;
};

const fetchLivestock = async (aquariumId: string): Promise<Livestock[]> => {
  const { data, error } = await supabase
    .from("livestock")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("added_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Livestock[]) || [];
};

const fetchEquipment = async (aquariumId: string): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Equipment[]) || [];
};

const fetchWaterParameters = async (aquariumId: string): Promise<WaterParameterReading[]> => {
  const { data, error } = await supabase
    .from("water_parameters")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("recorded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as WaterParameterReading[]) || [];
};

const fetchMaintenanceTasks = async (aquariumId: string): Promise<MaintenanceTask[]> => {
    const { data, error } = await supabase
        .from('maintenance')
        .select('*, equipment(type, brand, model)')
        .eq('aquarium_id', aquariumId)
        .order('completed_date', { ascending: false, nullsFirst: true })
        .order('due_date', { ascending: true, nullsFirst: false });
    
    if (error) throw new Error(error.message);
    return data as MaintenanceTask[] || [];
};

const AquariumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const { data: aquarium, isLoading: isAquariumLoading, error: aquariumError } = useQuery({
    queryKey: ['aquarium', id],
    queryFn: () => fetchAquariumById(id!),
    enabled: !!id && !!user,
  });

  const { data: livestock, isLoading: isLivestockLoading, error: livestockError } = useQuery({
    queryKey: ['livestock', id],
    queryFn: () => fetchLivestock(id!),
    enabled: !!id && !!user,
  });

  const { data: equipment, isLoading: isEquipmentLoading, error: equipmentError } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => fetchEquipment(id!),
    enabled: !!id && !!user,
  });
  
  const { data: waterParameters, isLoading: isWaterParamsLoading, error: waterParamsError } = useQuery({
    queryKey: ['water_parameters', id],
    queryFn: () => fetchWaterParameters(id!),
    enabled: !!id && !!user,
  });

  const { data: tasks, isLoading: isMaintenanceLoading, error: maintenanceError } = useQuery({
      queryKey: ['maintenance', id],
      queryFn: () => fetchMaintenanceTasks(id!),
      enabled: !!id && !!user,
  });

  const updateTaskMutation = useMutation({
      mutationFn: async ({ taskId, updates }: { taskId: string, updates: Partial<Tables<'maintenance'>> }) => {
          const { error } = await supabase.from('maintenance').update(updates).eq('id', taskId);
          if (error) throw new Error(error.message);
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
          toast({ title: 'Task updated!' });
      },
      onError: (err: Error) => {
          toast({ title: 'Error updating task', description: err.message, variant: 'destructive' });
      }
  });

  const deleteTaskMutation = useMutation({
      mutationFn: async (taskId: string) => {
          const { error } = await supabase.from('maintenance').delete().eq('id', taskId);
          if (error) throw new Error(error.message);
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
          toast({ title: 'Task deleted!' });
      },
      onError: (err: Error) => {
          toast({ title: 'Error deleting task', description: err.message, variant: 'destructive' });
      }
  });

  const handleMarkComplete = (taskId: string, completedDate: Date) => {
      updateTaskMutation.mutate({ taskId, updates: { completed_date: completedDate.toISOString() } });
  };

  const handleDeleteTask = (taskId: string) => {
      deleteTaskMutation.mutate(taskId);
  };

  const isLoading = authLoading || isAquariumLoading || isLivestockLoading || isEquipmentLoading || isWaterParamsLoading || isMaintenanceLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const queryError = aquariumError || livestockError || equipmentError || waterParamsError || maintenanceError;
  if (queryError) {
    return <div>Error: {queryError.message}</div>;
  }
  
  if (!aquarium) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Aquarium Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The aquarium you're looking for doesn't exist or you don't have permission to view it.
        </p>
      </div>
    );
  }

  const typedAquarium = aquarium as Aquarium;

  return (
    <div className="space-y-8">
      <AquariumHeader aquarium={typedAquarium} />
      
      <HealthRanking 
        waterParameters={waterParameters || []} 
        tasks={tasks || []} 
        aquariumType={typedAquarium.type} 
      />

      <WaterParametersSection
        waterParameters={waterParameters || []}
        aquariumId={aquarium.id}
        aquariumType={aquarium.type}
      />

      <MaintenanceSection
        tasks={tasks || []}
        aquariumId={aquarium.id}
        onMarkComplete={handleMarkComplete}
        onDelete={handleDeleteTask}
      />

      <LivestockSection
        livestock={livestock || []}
        aquariumId={aquarium.id}
      />
      
      <EquipmentSection
        equipment={equipment || []}
        aquariumId={aquarium.id}
      />

      {/* Recommendations Section */}
      <section>
        <AquariumRecommendations aquariumType={typedAquarium.type} />
      </section>

      <Tabs defaultValue="journal" className="mt-4">
        <TabsList>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <JournalTab aquariumId={aquarium.id} />
        </TabsContent>
        <TabsContent value="wishlist">
          <WishlistTab aquariumId={aquarium.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AquariumDetail;
