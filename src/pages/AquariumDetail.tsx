import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LivestockTab from "@/components/aquarium/LivestockTab";
import WaterParametersTab from "@/components/aquarium/WaterParametersTab";
import EquipmentTab from "@/components/aquarium/EquipmentTab";
import JournalTab from "@/components/aquarium/JournalTab";
import WishlistTab from "@/components/aquarium/WishlistTab";

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

const AquariumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const { data: aquarium, isLoading, error } = useQuery({
    queryKey: ['aquarium', id],
    queryFn: () => fetchAquariumById(id!),
    enabled: !!id && !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-6 w-48" />
        <div className="mt-6 p-8 border rounded-lg bg-card">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
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
    <div>
      <h1 className="text-2xl font-semibold">{aquarium.name}</h1>
      <p className="text-muted-foreground mt-2">
        {aquarium.type} - {aquarium.size} Gallons
      </p>
      
      <Tabs defaultValue="livestock" className="mt-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="livestock">Livestock</TabsTrigger>
          <TabsTrigger value="water-parameters">Water Parameters</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="mt-2 p-8 border rounded-lg bg-card">
            <h2 className="text-lg font-semibold mb-4">Aquarium Details</h2>
            <p>Details about the aquarium will go here.</p>
          </div>
        </TabsContent>
        <TabsContent value="livestock">
          <LivestockTab aquariumId={aquarium.id} />
        </TabsContent>
        <TabsContent value="water-parameters">
          <WaterParametersTab aquariumId={aquarium.id} aquariumType={aquarium.type} />
        </TabsContent>
        <TabsContent value="equipment">
          <EquipmentTab aquariumId={aquarium.id} />
        </TabsContent>
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
