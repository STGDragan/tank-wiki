
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
import WishlistTab from "@/components/aquarium/WishlistTab";
import { TimelineTab } from "@/components/aquarium/TimelineTab";
import { AquariumRecommendationsContainer } from "@/components/aquarium/AquariumRecommendationsContainer";
import { JournalTab } from "@/components/aquarium/JournalTab";
import { LogTab } from "@/components/aquarium/LogTab";
import { WizardProgressTracker } from "@/components/aquarium/WizardProgressTracker";
import { TankHealthIndicator } from "@/components/aquarium/TankHealthIndicator";

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
    journalEntries,
    medications,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !aquarium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground">Aquarium not found</h2>
          <p className="text-muted-foreground mt-2">
            {error?.message || "The aquarium you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  const canEdit = aquarium.user_id === user.id;
  const latestWaterReading = waterParameters && waterParameters.length > 0 ? waterParameters[0] : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-6 p-6">
        <AquariumHeader aquarium={aquarium} />

        {/* Tank Health Indicator - Prominent placement */}
        <TankHealthIndicator
          waterParameters={waterParameters}
          maintenanceTasks={tasks}
          livestock={livestock}
          equipment={equipment}
          aquariumType={aquarium.type}
          aquariumSize={aquarium.size}
        />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 bg-white/80 backdrop-blur-sm border shadow-sm dark:bg-slate-800/80 dark:border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Overview</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Progress</TabsTrigger>
            <TabsTrigger value="livestock" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Livestock</TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Equipment</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Maintenance</TabsTrigger>
            <TabsTrigger value="water" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Water Tests</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Timeline</TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Wishlist</TabsTrigger>
            <TabsTrigger value="journal" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Journal</TabsTrigger>
            <TabsTrigger value="log" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <LivestockSection
              livestock={livestock || []}
              aquariumId={aquarium.id}
              aquariumType={aquarium.type}
              canEdit={canEdit}
              onUpdateQuantity={handleUpdateLivestockQuantity}
              onDelete={handleDeleteLivestock}
              showRecommendations={false}
            />
            <EquipmentSection
              equipment={equipment || []}
              aquariumId={aquarium.id}
              aquariumType={aquarium.type}
              canEdit={canEdit}
              onDelete={handleDeleteEquipment}
              showRecommendations={false}
            />
            <MaintenanceSection
              tasks={pendingTasks || []}
              aquariumId={aquarium.id}
              aquariumType={aquarium.type}
              aquariumSize={aquarium.size}
              onMarkComplete={handleMarkComplete}
              onDelete={handleDeleteTask}
              showRecommendations={false}
            />
            <AquariumRecommendationsContainer
              aquariumId={aquarium.id}
              aquariumType={aquarium.type}
              userId={user.id}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <WizardProgressTracker 
              aquariumId={aquarium.id}
              userId={user.id}
              aquariumCount={0}
            />
          </TabsContent>

          <TabsContent value="livestock" className="space-y-6">
            <LivestockSection
              livestock={livestock || []}
              aquariumId={aquarium.id}
              aquariumType={aquarium.type}
              canEdit={canEdit}
              onUpdateQuantity={handleUpdateLivestockQuantity}
              onDelete={handleDeleteLivestock}
              showRecommendations={false}
            />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <EquipmentSection
              equipment={equipment || []}
              aquariumId={aquarium.id}
              aquariumType={aquarium.type}
              canEdit={canEdit}
              onDelete={handleDeleteEquipment}
              showRecommendations={false}
            />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <MaintenanceSection
              tasks={tasks || []}
              aquariumId={aquarium.id}
              aquariumType={aquarium.type}
              aquariumSize={aquarium.size}
              onMarkComplete={handleMarkComplete}
              onDelete={handleDeleteTask}
              showRecommendations={false}
            />
          </TabsContent>

          <TabsContent value="water" className="space-y-6">
            <WaterParametersSection
              aquariumId={aquarium.id}
              aquariumType={aquarium.type}
              latestReading={latestWaterReading}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab
              aquariumId={aquarium.id}
              userId={user.id}
              canEdit={canEdit}
            />
          </TabsContent>

          <TabsContent value="wishlist">
            <WishlistTab aquariumId={aquarium.id} canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="journal">
            <JournalTab
              aquariumId={aquarium.id}
              canEdit={canEdit}
              userId={user.id}
              tasks={tasks}
              livestock={livestock}
              waterParameters={waterParameters}
              equipment={equipment}
            />
          </TabsContent>

          <TabsContent value="log">
            <LogTab
              aquariumId={aquarium.id}
              canEdit={canEdit}
              userId={user.id}
              tasks={tasks}
              livestock={livestock}
              waterParameters={waterParameters}
              equipment={equipment}
              journalEntries={journalEntries}
              aquariumType={aquarium.type}
              medications={medications}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AquariumDetail;
