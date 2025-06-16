
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saltwaterRecommendations, freshwaterRecommendations, Recommendation } from "@/data/recommendations";
import RecommendationCarousel from "../recommendations/RecommendationCarousel";

interface EquipmentRecommendationsProps {
  aquariumType: string | null | undefined;
  existingEquipment?: { type: string; brand: string | null; model: string | null }[];
}

export function EquipmentRecommendations({ aquariumType, existingEquipment = [] }: EquipmentRecommendationsProps) {
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

  // Filter recommendations for equipment only
  const equipmentRecommendations = allRecommendations.filter(r => r.type === 'equipment');

  // Filter out equipment that the user already has
  const filteredEquipmentRecommendations = equipmentRecommendations.filter(recommendation => {
    return !existingEquipment.some(equipment => {
      // Check if the recommendation name contains any of the equipment type keywords
      const equipmentType = equipment.type.toLowerCase();
      const recommendationName = recommendation.name.toLowerCase();
      
      // Simple matching - if the equipment type is found in the recommendation name
      return recommendationName.includes(equipmentType) || 
             equipmentType.includes(recommendationName.split(' ')[0]);
    });
  });

  if (filteredEquipmentRecommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          {isSaltwaterType ? 'Recommended Saltwater Equipment' : 'Recommended Freshwater Equipment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RecommendationCarousel items={filteredEquipmentRecommendations} />
      </CardContent>
    </Card>
  );
}
