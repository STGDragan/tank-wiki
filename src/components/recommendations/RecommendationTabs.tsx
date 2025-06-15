
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
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="inhabitants">Inhabitants</TabsTrigger>
        <TabsTrigger value="equipment">Equipment</TabsTrigger>
        <TabsTrigger value="consumables">Consumables</TabsTrigger>
        <TabsTrigger value="food">Food</TabsTrigger>
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
