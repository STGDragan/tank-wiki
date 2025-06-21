
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecommendationCarousel from "@/components/recommendations/RecommendationCarousel";

// Define a type for database products instead of static recommendations
interface DatabaseProduct {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  imageurls?: string[];
  regular_price?: number;
  sale_price?: number;
  is_on_sale?: boolean;
  is_featured?: boolean;
  is_recommended?: boolean;
  brand?: string;
  affiliate_links?: Array<{
    link_url: string;
    provider?: string;
  }>;
}

const RecommendationTabs = ({ recommendations }: { recommendations: DatabaseProduct[] }) => {
  const inhabitants = recommendations.filter(r => r.category === 'livestock' || r.is_livestock === true);
  const equipment = recommendations.filter(r => r.category === 'equipment');
  const consumables = recommendations.filter(r => r.category === 'consumable');
  const food = recommendations.filter(r => r.category === 'food');

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
        <ReRecommendationCarousel items={equipment} />
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
