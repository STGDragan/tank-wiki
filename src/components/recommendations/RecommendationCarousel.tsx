
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
import { useNavigate } from "react-router-dom";

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

interface RecommendationCarouselProps {
  items: DatabaseProduct[];
}

const RecommendationCarousel = ({ items }: RecommendationCarouselProps) => {
  const navigate = useNavigate();

  const getEffectivePrice = (product: DatabaseProduct) => {
    if (product.is_on_sale && product.sale_price && 
        product.regular_price && product.sale_price < product.regular_price) {
      return product.sale_price;
    }
    return product.regular_price;
  };

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
        {items.map((item, index) => {
          const effectivePrice = getEffectivePrice(item);
          const imageUrl = item.imageurls?.[0] || item.image_url || '/placeholder.svg';

          return (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.is_on_sale && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        Sale
                      </Badge>
                    )}
                    {item.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Featured
                      </Badge>
                    )}
                    {item.is_recommended && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
                  
                  {item.brand && (
                    <p className="text-sm text-muted-foreground mb-2">
                      by {item.brand}
                    </p>
                  )}
                  
                  {effectivePrice && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-primary">
                        ${effectivePrice.toFixed(2)}
                      </span>
                      {item.is_on_sale && item.regular_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${item.regular_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      View Details
                    </Button>
                    {item.affiliate_links?.[0]?.link_url && (
                      <Button 
                        size="sm"
                        onClick={() => window.open(item.affiliate_links[0].link_url, '_blank')}
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
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

export default RecommendationCarousel;
