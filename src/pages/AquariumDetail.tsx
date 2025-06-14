
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { PlusCircle } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AddLivestockForm } from "@/components/aquarium/AddLivestockForm";
import { EquipmentCard } from "@/components/aquarium/EquipmentCard";
import { AddEquipmentForm } from "@/components/aquarium/AddEquipmentForm";
import { WaterParameterCard } from "@/components/aquarium/WaterParameterCard";
import { AddWaterParameterForm } from "@/components/aquarium/AddWaterParameterForm";

type Livestock = Tables<'livestock'>;
type Equipment = Tables<'equipment'>;
type WaterParameterReading = Tables<'water_parameters'> & {
  salinity?: number | null;
  alkalinity?: number | null;
  calcium?: number | null;
  magnesium?: number | null;
};

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
  return data || [];
};

const fetchEquipment = async (aquariumId: string): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
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

const AquariumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [isAddLivestockOpen, setAddLivestockOpen] = useState(false);
  const [isAddEquipmentOpen, setAddEquipmentOpen] = useState(false);
  const [isAddWaterParamsOpen, setAddWaterParamsOpen] = useState(false);

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

  const isLoading = authLoading || isAquariumLoading || isLivestockLoading || isEquipmentLoading || isWaterParamsLoading;

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

  const queryError = aquariumError || livestockError || equipmentError || waterParamsError;
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{aquarium.name}</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          {aquarium.type} - {aquarium.size} Gallons
        </p>
      </div>
      
      <HealthRanking waterParameters={waterParameters || []} aquariumType={aquarium.type} />

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
