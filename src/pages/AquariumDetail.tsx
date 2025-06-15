
import { useParams } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AquariumHeader } from "@/components/aquarium/AquariumHeader";
import { LivestockSection } from "@/components/aquarium/LivestockSection";
import { EquipmentSection } from "@/components/aquarium/EquipmentSection";
import { WaterParametersSection } from "@/components/aquarium/WaterParametersSection";
import { MaintenanceSection } from "@/components/aquarium/MaintenanceSection";
import { JournalTab } from "@/components/aquarium/JournalTab";
import { WishlistTab } from "@/components/aquarium/WishlistTab";
import { LogTab } from "@/components/aquarium/LogTab";
import { InvitationsList } from "@/components/aquarium/InvitationsList";
import { useAquariumData } from "@/hooks/useAquariumData";
import { useAquariumMutations } from "@/hooks/useAquariumMutations";
import { Skeleton } from "@/components/ui/skeleton";

const AquariumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const {
    aquarium,
    livestock,
    equipment,
    waterParameters,
    tasks,
    presets,
    customSettings,
    pendingTasks,
    isLoading,
    error,
  } = useAquariumData(id, user?.id);

  const {
    handleMarkComplete,
    handleUpdateLivestockQuantity,
    handleDeleteTask,
    handleDeleteLivestock,
    handleDeleteEquipment,
  } = useAquariumMutations(id, user?.id, tasks);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!aquarium) {
    return <div>Aquarium not found</div>;
  }

  const isOwner = user?.id === aquarium.user_id;

  return (
    <div className="space-y-8">
      <AquariumHeader aquarium={aquarium} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Tasks</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
          {isOwner && <TabsTrigger value="sharing">Sharing</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <LivestockSection 
              livestock={livestock}
              onUpdateQuantity={handleUpdateLivestockQuantity}
              onDelete={handleDeleteLivestock}
              aquariumId={id!}
              canEdit={isOwner}
            />
            <EquipmentSection 
              equipment={equipment}
              onDelete={handleDeleteEquipment}
              aquariumId={id!}
              canEdit={isOwner}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="maintenance">
          <MaintenanceSection 
            tasks={tasks}
            pendingTasks={pendingTasks}
            onMarkComplete={handleMarkComplete}
            onDeleteTask={handleDeleteTask}
            aquariumId={id!}
            equipment={equipment}
            canEdit={isOwner}
          />
        </TabsContent>
        
        <TabsContent value="water">
          <WaterParametersSection 
            waterParameters={waterParameters}
            aquariumId={id!}
            presets={presets}
            customSettings={customSettings}
            canEdit={isOwner}
          />
        </TabsContent>
        
        <TabsContent value="journal">
          <JournalTab aquariumId={id!} canEdit={isOwner} />
        </TabsContent>
        
        <TabsContent value="wishlist">
          <WishlistTab aquariumId={id!} canEdit={isOwner} />
        </TabsContent>
        
        <TabsContent value="log">
          <LogTab aquariumId={id!} />
        </TabsContent>

        {isOwner && (
          <TabsContent value="sharing">
            <InvitationsList aquariumId={id!} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AquariumDetail;
