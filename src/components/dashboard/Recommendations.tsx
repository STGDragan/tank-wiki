
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

type Aquarium = Pick<Tables<'aquariums'>, 'type'>;

const saltwaterRecommendations = [
  {
    type: 'livestock',
    name: 'Clownfish',
    description: 'A popular and hardy saltwater fish.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Clownfish',
  },
  {
    type: 'equipment',
    name: 'AI Prime 16HD Light',
    description: 'Powerful and popular reef tank lighting.',
    imageUrl: 'https://placehold.co/300x200/3B82F6/FFFFFF?text=AI+Prime',
  },
  {
    type: 'livestock',
    name: 'Royal Gramma',
    description: 'A beautiful and peaceful fish for reef tanks.',
    imageUrl: 'https://placehold.co/300x200/6D28D9/FFFFFF?text=Royal+Gramma',
  },
  {
    type: 'consumable',
    name: 'Red Sea Salt Mix',
    description: 'High-quality salt for creating optimal water conditions.',
    imageUrl: 'https://placehold.co/300x200/EF4444/FFFFFF?text=Red+Sea+Salt',
  },
  {
    type: 'food',
    name: 'Hikari Marine-S Pellets',
    description: 'Nutritious food for marine fish.',
    imageUrl: 'https://placehold.co/300x200/F59E0B/FFFFFF?text=Hikari+Food',
  },
];

const freshwaterRecommendations = [
  {
    type: 'livestock',
    name: 'Java Fern',
    description: 'An easy-to-care-for plant, great for beginners.',
    imageUrl: 'https://placehold.co/300x200/16A34A/FFFFFF?text=Java+Fern',
  },
  {
    type: 'equipment',
    name: '50W Aquarium Heater',
    description: 'Essential for maintaining stable water temperature.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Heater',
  },
  {
    type: 'consumable',
    name: 'Seachem Prime',
    description: 'A complete and concentrated water conditioner.',
    imageUrl: 'https://placehold.co/300x200/9333EA/FFFFFF?text=Seachem',
  },
  {
    type: 'livestock',
    name: 'Neon Tetra',
    description: 'A small, peaceful, and vibrant schooling fish.',
    imageUrl: 'https://placehold.co/300x200/38BDF8/FFFFFF?text=Neon+Tetra',
  },
  {
    type: 'food',
    name: 'Hikari Micro Pellets',
    description: 'Ideal for small tropical fish.',
    imageUrl: 'https://placehold.co/300x200/F59E0B/FFFFFF?text=Hikari+Food',
  },
];

type Recommendation = typeof saltwaterRecommendations[0];

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

  if (!hasSaltwater && !hasFreshwater) {
    return null;
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
