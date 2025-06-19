
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Recommendation } from "@/data/recommendations";
import { useNavigate } from "react-router-dom";

interface RecommendationCarouselProps {
  items: Recommendation[];
}

const RecommendationCarousel = ({ items }: RecommendationCarouselProps) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recommendations available for this category.
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {items.map((item, index) => (
          <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.sale && (
                  <Badge className="absolute top-2 left-2 bg-red-100 text-red-800 hover:bg-red-100">
                    Sale
                  </Badge>
                )}
                {item.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Featured
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  {item.salePrice ? (
                    <>
                      <span className="text-lg font-bold text-primary">
                        ${item.salePrice.toFixed(2)}
                      </span>
                      {item.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </>
                  ) : item.price ? (
                    <span className="text-lg font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </span>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      if (item.productId) {
                        navigate(`/product/${item.productId}`);
                      }
                    }}
                  >
                    View Details
                  </Button>
                  {item.link && (
                    <Button 
                      size="sm"
                      onClick={() => window.open(item.link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

export default RecommendationCarousel;
