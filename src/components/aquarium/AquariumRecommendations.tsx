
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saltwaterRecommendations, freshwaterRecommendations, Recommendation } from "@/data/recommendations";

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

interface AquariumRecommendationsProps {
  aquariumType: string | null | undefined;
}

export function AquariumRecommendations({ aquariumType }: AquariumRecommendationsProps) {
  let recommendations: Recommendation[] = [];
  const lowercasedType = aquariumType?.toLowerCase();

  if (lowercasedType === 'saltwater') {
    recommendations = saltwaterRecommendations;
  } else if (lowercasedType === 'freshwater') {
    recommendations = freshwaterRecommendations;
  }

  if (recommendations.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recommendations For You</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">
                    Set an aquarium type (freshwater or saltwater) to see recommendations.
                </p>
            </CardContent>
        </Card>
    );
  }

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
