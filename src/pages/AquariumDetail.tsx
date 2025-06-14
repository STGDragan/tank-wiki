import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JournalTab from "@/components/aquarium/JournalTab";
import WishlistTab from "@/components/aquarium/WishlistTab";
import { HealthRanking } from "@/components/aquarium/HealthRanking";
import { Tables } from "@/integrations/supabase/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { LivestockCard } from "@/components/aquarium/LivestockCard";
import { Button } from "@/components/ui/button";
import { Camera, PlusCircle } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AddLivestockForm } from "@/components/aquarium/AddLivestockForm";
import { EquipmentCard } from "@/components/aquarium/EquipmentCard";
import { AddEquipmentForm } from "@/components/aquarium/AddEquipmentForm";
import { WaterParameterCard } from "@/components/aquarium/WaterParameterCard";
import { AddWaterParameterForm } from "@/components/aquarium/AddWaterParameterForm";
import { MaintenanceCard } from "@/components/aquarium/MaintenanceCard";
import { AddMaintenanceTaskForm } from "@/components/aquarium/AddMaintenanceTaskForm";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ImageUploader } from "@/components/aquarium/ImageUploader";

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
  
  const [isAddLivestockOpen, setAddLivestockOpen] = useState(false);
  const [isAddEquipmentOpen, setAddEquipmentOpen] = useState(false);
  const [isAddWaterParamsOpen, setAddWaterParamsOpen] = useState(false);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [isImagePopoverOpen, setImagePopoverOpen] = useState(false);

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

  const handleMarkComplete = (taskId: string) => {
      updateTaskMutation.mutate({ taskId, updates: { completed_date: new Date().toISOString() } });
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
      <div className="relative rounded-lg overflow-hidden">
        <img 
            src={typedAquarium.image_url || `https://placehold.co/1200x400/34D399/FFFFFF?text=${encodeURIComponent(typedAquarium.name)}`} 
            alt={typedAquarium.name} 
            className="w-full h-48 md:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 md:p-6">
            <h1 className="text-2xl md:text-4xl font-bold text-white shadow-lg">{typedAquarium.name}</h1>
            <p className="text-lg text-gray-200 mt-1 shadow-md">
                {typedAquarium.type} - {typedAquarium.size} Gallons
            </p>
        </div>
        <div className="absolute top-4 right-4">
            <Popover open={isImagePopoverOpen} onOpenChange={setImagePopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="secondary" size="icon">
                        <Camera className="h-5 w-5" />
                        <span className="sr-only">Change Image</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h4 className="font-medium leading-none">Tank Image</h4>
                            <p className="text-sm text-muted-foreground">Upload a new main image for your tank.</p>
                        </div>
                        <ImageUploader 
                            aquariumId={typedAquarium.id}
                            onUploadSuccess={() => setImagePopoverOpen(false)} 
                            table="aquariums"
                            recordId={typedAquarium.id}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      </div>
      
      <HealthRanking waterParameters={waterParameters || []} aquariumType={typedAquarium.type} />

      {/* Water Parameters Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Water Parameters</h2>
           <Drawer open={isAddWaterParamsOpen} onOpenChange={setAddWaterParamsOpen}>
            <DrawerTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Reading</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Add New Water Parameter Reading</DrawerTitle></DrawerHeader>
              <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto"><AddWaterParameterForm aquariumId={aquarium.id} aquariumType={aquarium.type} onSuccess={() => setAddWaterParamsOpen(false)} /></div>
            </DrawerContent>
          </Drawer>
        </div>
        {waterParameters && waterParameters.length > 0 ? (
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {waterParameters.map((item) => (
                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"><WaterParameterCard reading={item} aquariumType={aquarium.type} /></CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious /><CarouselNext />
          </Carousel>
        ) : <p className="text-muted-foreground">No water parameter readings yet.</p>}
      </section>

      {/* Maintenance Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Maintenance Schedule</h2>
          <Drawer open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
            <DrawerTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Add New Maintenance Task</DrawerTitle></DrawerHeader>
              <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
                <AddMaintenanceTaskForm aquariumId={aquarium.id} onSuccess={() => setAddTaskOpen(false)} />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        {tasks && tasks.length > 0 ? (
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {tasks.map((task) => (
                <CarouselItem key={task.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <MaintenanceCard task={task} onMarkComplete={handleMarkComplete} onDelete={handleDeleteTask} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious /><CarouselNext />
          </Carousel>
        ) : <p className="text-muted-foreground">No maintenance tasks added yet.</p>}
      </section>

      {/* Livestock Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Livestock</h2>
          <Drawer open={isAddLivestockOpen} onOpenChange={setAddLivestockOpen}>
            <DrawerTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Livestock</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Add New Livestock</DrawerTitle></DrawerHeader>
              <div className="px-4 pb-4"><AddLivestockForm aquariumId={aquarium.id} onSuccess={() => setAddLivestockOpen(false)} /></div>
            </DrawerContent>
          </Drawer>
        </div>
        {livestock && livestock.length > 0 ? (
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {livestock.map((item) => (
                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"><LivestockCard livestock={item} /></CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious /><CarouselNext />
          </Carousel>
        ) : <p className="text-muted-foreground">No livestock added yet.</p>}
      </section>
      
      {/* Equipment Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Equipment</h2>
           <Drawer open={isAddEquipmentOpen} onOpenChange={setAddEquipmentOpen}>
            <DrawerTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Equipment</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Add New Equipment</DrawerTitle></DrawerHeader>
              <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto"><AddEquipmentForm aquariumId={aquarium.id} onSuccess={() => setAddEquipmentOpen(false)} /></div>
            </DrawerContent>
          </Drawer>
        </div>
        {equipment && equipment.length > 0 ? (
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {equipment.map((item) => (
                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"><EquipmentCard equipment={item} /></CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious /><CarouselNext />
          </Carousel>
        ) : <p className="text-muted-foreground">No equipment added yet.</p>}
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
