
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saltwaterRecommendations, freshwaterRecommendations, Recommendation } from "@/data/recommendations";
import RecommendationCarousel from "../recommendations/RecommendationCarousel";

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
        <RecommendationCarousel items={consumableRecommendations} />
      </CardContent>
    </Card>
  );
}
