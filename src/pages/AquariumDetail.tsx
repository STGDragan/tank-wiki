
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JournalTab from "@/components/aquarium/JournalTab";
import WishlistTab from "@/components/aquarium/WishlistTab";
import { HealthRanking } from "@/components/aquarium/HealthRanking";
import { Tables } from "@/integrations/supabase/types";
import { AquariumRecommendations } from "@/components/aquarium/AquariumRecommendations";
import { AquariumHeader } from "@/components/aquarium/AquariumHeader";
import { WaterParametersSection } from "@/components/aquarium/WaterParametersSection";
import { MaintenanceSection } from "@/components/aquarium/MaintenanceSection";
import { LivestockSection } from "@/components/aquarium/LivestockSection";
import { EquipmentSection } from "@/components/aquarium/EquipmentSection";
import { LogTab } from "@/components/aquarium/LogTab";
import { useAquariumData } from "@/hooks/useAquariumData";
import { useAquariumMutations } from "@/hooks/useAquariumMutations";
import { useLogEntries } from "@/hooks/useLogEntries";

type Aquarium = Tables<'aquariums'> & { image_url?: string | null };

const AquariumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const {
    aquarium,
    livestock,
    equipment,
    waterParameters,
    tasks,
    presets,
    customSettings,
    pendingTasks,
    isLoading: isDataLoading,
    error: dataError
  } = useAquariumData(id, user?.id);

  const {
    handleMarkComplete,
    handleUpdateLivestockQuantity,
    handleDeleteTask,
    handleDeleteLivestock,
    handleDeleteEquipment,
  } = useAquariumMutations(id, user?.id, tasks);

  const logEntries = useLogEntries(tasks, livestock, waterParameters, equipment);

  const isLoading = authLoading || isDataLoading;

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

  if (dataError) {
    return <div>Error: {dataError.message}</div>;
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
        presets={presets || []}
        customSettings={customSettings || []}
      />

      <WaterParametersSection
        aquariumId={aquarium.id}
        aquariumType={typedAquarium.type}
        latestReading={waterParameters?.[0]}
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
        onUpdateQuantity={handleUpdateLivestockQuantity}
        onDelete={handleDeleteLivestock}
      />
      
      <EquipmentSection
        equipment={equipment || []}
        aquariumId={aquarium.id}
        onDelete={handleDeleteEquipment}
      />

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
