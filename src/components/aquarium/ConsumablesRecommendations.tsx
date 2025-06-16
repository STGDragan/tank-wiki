
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saltwaterRecommendations, freshwaterRecommendations, Recommendation } from "@/data/recommendations";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ConsumablesRecommendationsProps {
  aquariumType: string | null | undefined;
}

export function ConsumablesRecommendations({ aquariumType }: ConsumablesRecommendationsProps) {
  let allRecommendations: Recommendation[] = [];
  
  // Determine if tank type is freshwater or saltwater based
  const isFreshwaterType = aquariumType === "Freshwater" || 
                          aquariumType === "Planted Freshwater" || 
                          aquariumType === "Freshwater Invertebrates";
  
  const isSaltwaterType = aquariumType === "Saltwater Fish-Only (FO)" ||
                         aquariumType === "Fish-Only with Live Rock (FOWLR)" ||
                         aquariumType === "Soft Coral Reef" ||
                         aquariumType === "Mixed Reef (LPS + Soft)" ||
                         aquariumType === "SPS Reef (Hard Coral)";

  if (isSaltwaterType) {
    allRecommendations = saltwaterRecommendations;
  } else if (isFreshwaterType) {
    allRecommendations = freshwaterRecommendations;
  }

  if (allRecommendations.length === 0) {
    return null;
  }

  // Filter recommendations for consumables only
  const consumableRecommendations = allRecommendations.filter(r => r.type === 'consumable');

  if (consumableRecommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          {isSaltwaterType ? 'Recommended Marine Consumables' : 'Recommended Freshwater Consumables'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {consumableRecommendations.map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="border rounded-lg p-4 space-y-3 h-full flex flex-col">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{item.description}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-auto">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12" />
          <CarouselNext className="mr-12" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
