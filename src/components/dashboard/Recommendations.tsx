
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

// This would eventually come from an API based on user's tanks
const recommendations = [
  {
    type: 'livestock',
    name: 'Clownfish',
    description: 'Great for saltwater tanks.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Clownfish',
  },
  {
    type: 'equipment',
    name: 'AI Prime 16HD Light',
    description: 'Popular reef tank lighting.',
    imageUrl: 'https://placehold.co/300x200/3B82F6/FFFFFF?text=AI+Prime',
  },
  {
    type: 'livestock',
    name: 'Java Fern',
    description: 'Easy-to-care-for plant.',
    imageUrl: 'https://placehold.co/300x200/16A34A/FFFFFF?text=Java+Fern',
  },
  {
    type: 'consumable',
    name: 'Seachem Prime',
    description: 'Essential water conditioner.',
    imageUrl: 'https://placehold.co/300x200/9333EA/FFFFFF?text=Seachem',
  },
    {
    type: 'equipment',
    name: 'Heater 50W',
    description: 'Keeps your tank warm.',
    imageUrl: 'https://placehold.co/300x200/F97316/FFFFFF?text=Heater',
  },
];

export function Recommendations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <CardDescription>Based on your aquariums, here are some suggestions for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full px-12"
        >
          <CarouselContent>
            {recommendations.map((item, index) => (
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
      </CardContent>
    </Card>
  );
}
