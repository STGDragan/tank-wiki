
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { saltwaterRecommendations, freshwaterRecommendations, Recommendation } from "@/data/recommendations";

type Aquarium = Pick<Tables<'aquariums'>, 'type'>;

const RecommendationCarousel = ({ title, items }: { title: string; items: Recommendation[] }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full px-12"
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
    </div>
  );
};

interface RecommendationsProps {
  aquariums: Aquarium[];
}

export function Recommendations({ aquariums }: RecommendationsProps) {
  const hasSaltwater = aquariums.some((aq) => aq.type === 'saltwater');
  const hasFreshwater = aquariums.some((aq) => aq.type === 'freshwater');

  const noTypedAquariums = !hasSaltwater && !hasFreshwater;

  // Since this component is only rendered from the dashboard when aquariums.length > 0,
  // noTypedAquariums being true means there are aquariums, but none have a type set.
  if (noTypedAquariums) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Set an aquarium type to get personalized suggestions. In the meantime, check out these popular items!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <RecommendationCarousel title="Popular Saltwater Items" items={saltwaterRecommendations} />
          <RecommendationCarousel title="Popular Freshwater Items" items={freshwaterRecommendations} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <CardDescription>Based on your aquariums, here are some suggestions for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {hasSaltwater && <RecommendationCarousel title="For Your Saltwater Aquarium(s)" items={saltwaterRecommendations} />}
        {hasFreshwater && <RecommendationCarousel title="For Your Freshwater Aquarium(s)" items={freshwaterRecommendations} />}
      </CardContent>
    </Card>
  );
}
