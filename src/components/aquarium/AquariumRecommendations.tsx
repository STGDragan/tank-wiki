
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This would eventually come from an API based on the specific tank
const recommendations = [
  {
    type: 'livestock',
    name: 'Clownfish',
    description: 'Great for saltwater tanks.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Clownfish',
  },
  {
    type: 'livestock',
    name: 'Royal Gramma',
    description: 'A beautiful and peaceful fish.',
    imageUrl: 'https://placehold.co/300x200/6D28D9/FFFFFF?text=Royal+Gramma',
  },
  {
    type: 'equipment',
    name: 'AI Prime 16HD Light',
    description: 'Popular reef tank lighting.',
    imageUrl: 'https://placehold.co/300x200/3B82F6/FFFFFF?text=AI+Prime',
  },
  {
    type: 'equipment',
    name: 'Heater 50W',
    description: 'Keeps your tank warm.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Heater',
  },
  {
    type: 'consumable',
    name: 'Seachem Prime',
    description: 'Essential water conditioner.',
    imageUrl: 'https://placehold.co/300x200/9333EA/FFFFFF?text=Seachem',
  },
  {
    type: 'consumable',
    name: 'Red Sea Salt Mix',
    description: 'High-quality salt for reef tanks.',
    imageUrl: 'https://placehold.co/300x200/EF4444/FFFFFF?text=Red+Sea+Salt',
  },
  {
    type: 'food',
    name: 'Hikari Marine-S Pellets',
    description: 'Nutritious food for marine fish.',
    imageUrl: 'https://placehold.co/300x200/F59E0B/FFFFFF?text=Hikari+Food',
  },
  {
    type: 'food',
    name: 'New Life Spectrum Flakes',
    description: 'Color-enhancing flake food.',
    imageUrl: 'https://placehold.co/300x200/10B981/FFFFFF?text=NLS+Flakes',
  },
];

type Recommendation = typeof recommendations[0];

const RecommendationCarousel = ({ items }: { items: Recommendation[] }) => {
  if (items.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">No recommendations in this category yet.</p>;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: items.length > 2,
      }}
      className="w-full px-12 py-4"
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardHeader className="p-0">
                  <img src={item.imageUrl} alt={item.name} className="rounded-t-lg aspect-video object-cover w-full" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button variant="outline" className="w-full">
                    View Item
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export function AquariumRecommendations() {
  const inhabitants = recommendations.filter(r => r.type === 'livestock');
  const equipment = recommendations.filter(r => r.type === 'equipment');
  const consumables = recommendations.filter(r => r.type === 'consumable');
  const food = recommendations.filter(r => r.type === 'food');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations For You</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
