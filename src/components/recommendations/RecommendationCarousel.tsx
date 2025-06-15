
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Recommendation } from "@/data/recommendations";

const RecommendationCarousel = ({ items }: { items: Recommendation[] }) => {
  if (items.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">No recommendations in this category yet.</p>;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: items.length > 3,
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

export default RecommendationCarousel;
