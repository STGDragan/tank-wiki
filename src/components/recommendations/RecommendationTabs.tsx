
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecommendationCarousel from "@/components/recommendations/RecommendationCarousel";
import { Recommendation } from "@/data/recommendations";

const RecommendationTabs = ({ recommendations }: { recommendations: Recommendation[] }) => {
  const inhabitants = recommendations.filter(r => r.type === 'livestock');
  const equipment = recommendations.filter(r => r.type === 'equipment');
  const consumables = recommendations.filter(r => r.type === 'consumable');
  const food = recommendations.filter(r => r.type === 'food');

  return (
    <Tabs defaultValue="inhabitants" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 h-16 p-2 bg-muted/30 rounded-xl border">
        <TabsTrigger 
          value="inhabitants"
          className="text-base font-medium py-3 px-4 rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-accent/20 hover:bg-background/60 transition-all duration-200"
        >
          Inhabitants
        </TabsTrigger>
        <TabsTrigger 
          value="equipment"
          className="text-base font-medium py-3 px-4 rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-accent/20 hover:bg-background/60 transition-all duration-200"
        >
          Equipment
        </TabsTrigger>
        <TabsTrigger 
          value="consumables"
          className="text-base font-medium py-3 px-4 rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-accent/20 hover:bg-background/60 transition-all duration-200"
        >
          Consumables
        </TabsTrigger>
        <TabsTrigger 
          value="food"
          className="text-base font-medium py-3 px-4 rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-accent/20 hover:bg-background/60 transition-all duration-200"
        >
          Food
        </TabsTrigger>
      </TabsList>
      <TabsContent value="inhabitants">
        <RecommendationCarousel items={inhabitants} />
      </TabsContent>
      <TabsContent value="equipment">
        <RecommendationCarousel items={equipment} />
      </TabsContent>
      <TabsContent value="consumables">
        <RecommendationCarousel items={consumables} />
      </TabsContent>
      <TabsContent value="food">
        <RecommendationCarousel items={food} />
      </TabsContent>
    </Tabs>
  );
};

export default RecommendationTabs;
