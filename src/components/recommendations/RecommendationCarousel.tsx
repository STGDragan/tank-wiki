
import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Recommendation } from "@/data/recommendations";

interface RecommendationCarouselProps {
  items: Recommendation[];
}

const RecommendationCarousel = ({ items }: RecommendationCarouselProps) => {
  const [selectedItem, setSelectedItem] = useState<Recommendation | null>(null);

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + '...';
  };

  return (
    <>
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="h-[300px] cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader className="p-0 flex-shrink-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-sm font-semibold line-clamp-2">{item.name}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground line-clamp-4">
                          {truncateDescription(item.description)}
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <DialogDescription className="text-sm leading-relaxed">
                      {item.description}
                    </DialogDescription>
                  </div>
                </DialogContent>
              </Dialog>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-12" />
        <CarouselNext className="mr-12" />
      </Carousel>
    </>
  );
};

export default RecommendationCarousel;
