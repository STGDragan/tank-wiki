
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saltwaterRecommendations, freshwaterRecommendations } from "@/data/recommendations";
import RecommendationTabs from "@/components/recommendations/RecommendationTabs";

const ShoppingRecommendations = () => {
  return (
    <Tabs defaultValue="freshwater" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 h-14 p-2 bg-muted/50 rounded-xl">
        <TabsTrigger 
          value="freshwater" 
          className="text-lg font-semibold py-3 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-background/80 transition-all duration-200"
        >
          Freshwater
        </TabsTrigger>
        <TabsTrigger 
          value="saltwater"
          className="text-lg font-semibold py-3 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-background/80 transition-all duration-200"
        >
          Saltwater
        </TabsTrigger>
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
