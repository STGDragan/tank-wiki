
import { useParams, Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { useAquariumData } from "@/hooks/useAquariumData";
import { useAquariumMutations } from "@/hooks/useAquariumMutations";
import { AquariumHeader } from "@/components/aquarium/AquariumHeader";
import { LivestockSection } from "@/components/aquarium/LivestockSection";
import { EquipmentSection } from "@/components/aquarium/EquipmentSection";
import { WaterParametersSection } from "@/components/aquarium/WaterParametersSection";
import { MaintenanceSection } from "@/components/aquarium/MaintenanceSection";
import { LogTab } from "@/components/aquarium/LogTab";
import { WishlistTab } from "@/components/aquarium/WishlistTab";
import { JournalTab } from "@/components/aquarium/JournalTab";
import { TimelineTab } from "@/components/aquarium/TimelineTab";

const AquariumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const {
    aquarium,
    livestock,
    equipment,
    waterParameters,
    tasks,
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !aquarium) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Aquarium not found</h2>
        <p className="text-gray-600 mt-2">
          {error?.message || "The aquarium you're looking for doesn't exist."}
        </p>
      </div>
    );
  }

  const canEdit = aquarium.user_id === user.id;

  return (
    <div className="space-y-6">
      <AquariumHeader aquarium={aquarium} canEdit={canEdit} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="maintenance">Tasks</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LivestockSection
              livestock={livestock || []}
              canEdit={canEdit}
              onUpdateQuantity={handleUpdateLivestockQuantity}
              onDelete={handleDeleteLivestock}
            />
            <EquipmentSection
              equipment={equipment || []}
              canEdit={canEdit}
              onDelete={handleDeleteEquipment}
            />
          </div>
          <MaintenanceSection
            tasks={pendingTasks || []}
            onMarkComplete={handleMarkComplete}
            onDelete={handleDeleteTask}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab
            aquariumId={aquarium.id}
            userId={user.id}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="journal">
          <JournalTab aquariumId={aquarium.id} userId={user.id} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistTab aquariumId={aquarium.id} userId={user.id} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="log">
          <LogTab aquariumId={aquarium.id} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <MaintenanceSection
            tasks={tasks || []}
            onMarkComplete={handleMarkComplete}
            onDelete={handleDeleteTask}
            canEdit={canEdit}
            showAll={true}
          />
        </TabsContent>

        <TabsContent value="water" className="space-y-6">
          <WaterParametersSection
            aquariumId={aquarium.id}
            waterParameters={waterParameters || []}
            canEdit={canEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AquariumDetail;
