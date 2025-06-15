
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JournalTab from "@/components/aquarium/JournalTab";
import WishlistTab from "@/components/aquarium/WishlistTab";
import { HealthRanking } from "@/components/aquarium/HealthRanking";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { AquariumRecommendations } from "@/components/aquarium/AquariumRecommendations";
import { AquariumHeader } from "@/components/aquarium/AquariumHeader";
import { WaterParametersSection } from "@/components/aquarium/WaterParametersSection";
import { MaintenanceSection } from "@/components/aquarium/MaintenanceSection";
import { LivestockSection } from "@/components/aquarium/LivestockSection";
import { EquipmentSection } from "@/components/aquarium/EquipmentSection";
import { LogTab } from "@/components/aquarium/LogTab";
import { LastTestSection } from "@/components/aquarium/LastTestSection";
import { format, addDays, addWeeks, addMonths } from "date-fns";

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

  const completeTaskMutation = useMutation({
      mutationFn: async ({ taskId, completedDate }: { taskId: string, completedDate: Date }) => {
          const taskToComplete = tasks?.find(t => t.id === taskId);
          if (!taskToComplete) throw new Error("Task not found");
          if (!user) throw new Error("User not found");

          // 1. Mark current task as complete
          const { error: updateError } = await supabase.from('maintenance').update({ completed_date: completedDate.toISOString() }).eq('id', taskId);
          if (updateError) throw updateError;
          
          // 2. If recurring, create a new task
          if (taskToComplete.frequency) {
              const calculateNextDueDate = (lastCompleted: Date, frequency: string): Date => {
                  switch (frequency) {
                      case 'daily': return addDays(lastCompleted, 1);
                      case 'weekly': return addWeeks(lastCompleted, 1);
                      case 'every 2 weeks': return addWeeks(lastCompleted, 2);
                      case 'monthly': return addMonths(lastCompleted, 1);
                      default: return addWeeks(lastCompleted, 1); // Fallback
                  }
              };

              const nextDueDate = calculateNextDueDate(completedDate, taskToComplete.frequency);

              const newTask: TablesInsert<'maintenance'> = {
                  aquarium_id: taskToComplete.aquarium_id,
                  user_id: user.id,
                  task: taskToComplete.task,
                  notes: taskToComplete.notes,
                  due_date: nextDueDate.toISOString(),
                  equipment_id: taskToComplete.equipment_id,
                  frequency: taskToComplete.frequency,
              };

              const { error: insertError } = await supabase.from('maintenance').insert(newTask);
              if (insertError) throw insertError;
          }
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
          toast({ title: 'Task completed!' });
      },
      onError: (err: Error) => {
          toast({ title: 'Error completing task', description: err.message, variant: 'destructive' });
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
      completeTaskMutation.mutate({ taskId, completedDate });
  };

  const handleDeleteTask = (taskId: string) => {
      deleteTaskMutation.mutate(taskId);
  };

  const logEntries = useMemo(() => {
    type LogEntry = {
        id: string;
        type: 'maintenance' | 'livestock' | 'water_parameter' | 'equipment';
        date: Date;
        title: string;
        description: React.ReactNode;
    };
    const entries: LogEntry[] = [];

    // 1. Completed maintenance tasks
    const completedTasks = tasks?.filter(task => task.completed_date) || [];
    completedTasks.forEach(task => {
        entries.push({
            id: `m-${task.id}`,
            type: 'maintenance',
            date: new Date(task.completed_date!),
            title: 'Maintenance Task Completed',
            description: (
                <div>
                    <p className="font-semibold">{task.task}</p>
                    {task.notes && <p className="text-xs mt-1">Notes: {task.notes}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                        Task created on: {format(new Date(task.created_at), 'PP')}
                    </p>
                </div>
            )
        });
    });

    // 2. Livestock additions
    (livestock || []).forEach(item => {
        entries.push({
            id: `l-${item.id}`,
            type: 'livestock',
            date: new Date(item.added_at),
            title: 'Livestock Added',
            description: (
                <div>
                    <p className="font-semibold">{item.quantity}x {item.species}{item.name ? ` (${item.name})` : ''}</p>
                    {item.notes && <p className="text-xs mt-1">Notes: {item.notes}</p>}
                </div>
            )
        });
    });

    // 3. Water parameter readings
    (waterParameters || []).forEach(reading => {
        const params = [
            reading.temperature != null ? `Temp: ${reading.temperature}°` : null,
            reading.ph != null ? `pH: ${reading.ph}` : null,
            reading.nitrate != null ? `Nitrate: ${reading.nitrate} ppm` : null,
            reading.nitrite != null ? `Nitrite: ${reading.nitrite} ppm` : null,
            reading.ammonia != null ? `Ammonia: ${reading.ammonia} ppm` : null,
            reading.salinity != null ? `Salinity: ${reading.salinity} ppt` : null,
            reading.alkalinity != null ? `Alkalinity: ${reading.alkalinity} dKH` : null,
            reading.calcium != null ? `Calcium: ${reading.calcium} ppm` : null,
            reading.magnesium != null ? `Magnesium: ${reading.magnesium} ppm` : null,
        ].filter(Boolean).join(' | ');

        entries.push({
            id: `wp-${reading.id}`,
            type: 'water_parameter',
            date: new Date(reading.recorded_at),
            title: 'Water Parameters Tested',
            description: <p>{params}</p>
        });
    });

    // 4. Equipment additions
    (equipment || []).forEach(item => {
        entries.push({
            id: `eq-${item.id}`,
            type: 'equipment',
            date: new Date(item.installed_at || item.created_at),
            title: 'Equipment Added',
            description: (
                <div>
                    <p className="font-semibold">{item.type}{item.brand || item.model ? ` - ${[item.brand, item.model].filter(Boolean).join(' ')}` : ''}</p>
                    {item.notes && <p className="text-xs mt-1">Notes: {item.notes}</p>}
                </div>
            )
        });
    });

    // Sort all entries by date, descending
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [tasks, livestock, waterParameters, equipment]);

  const pendingTasks = useMemo(() => {
    return (tasks || []).filter(task => !task.completed_date);
  }, [tasks]);

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
        aquariumType={typedAquarium.type}
      />

      <MaintenanceSection
        tasks={pendingTasks}
        aquariumId={aquarium.id}
        aquariumType={typedAquarium.type}
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

      <LastTestSection 
        latestReading={waterParameters?.[0]}
        aquariumType={typedAquarium.type}
      />

      {/* Recommendations Section */}
      <section>
        <AquariumRecommendations aquariumType={typedAquarium.type} />
      </section>

      <Tabs defaultValue="log" className="mt-4">
        <TabsList>
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <JournalTab aquariumId={aquarium.id} />
        </TabsContent>
        <TabsContent value="log">
            <LogTab logEntries={logEntries} />
        </TabsContent>
        <TabsContent value="wishlist">
          <WishlistTab aquariumId={aquarium.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AquariumDetail;
