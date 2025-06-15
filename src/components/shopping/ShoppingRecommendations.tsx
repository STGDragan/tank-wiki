
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saltwaterRecommendations, freshwaterRecommendations } from "@/data/recommendations";
import RecommendationTabs from "@/components/recommendations/RecommendationTabs";

const ShoppingRecommendations = () => {
  return (
    <Tabs defaultValue="freshwater" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="freshwater">Freshwater</TabsTrigger>
        <TabsTrigger value="saltwater">Saltwater</TabsTrigger>
      </TabsList>
      <TabsContent value="freshwater">
        <RecommendationTabs recommendations={freshwaterRecommendations} />
      </TabsContent>
      <TabsContent value="saltwater">
        <RecommendationTabs recommendations={saltwaterRecommendations} />
      </TabsContent>
    </Tabs>
  );
};

export default ShoppingRecommendations;
