
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saltwaterRecommendations, freshwaterRecommendations, Recommendation } from "@/data/recommendations";
import RecommendationCarousel from "../recommendations/RecommendationCarousel";

interface AquariumRecommendationsProps {
  aquariumType: string | null | undefined;
  existingEquipment?: { type: string; brand: string | null; model: string | null }[];
}

export function AquariumRecommendations({ aquariumType, existingEquipment = [] }: AquariumRecommendationsProps) {
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
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recommendations For You</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">
                    Set an aquarium type to see recommendations.
                </p>
            </CardContent>
        </Card>
    );
  }

  // Filter recommendations into inhabitants and equipment
  const inhabitantRecommendations = allRecommendations.filter(r => r.type === 'livestock');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations For You</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {inhabitantRecommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isSaltwaterType ? 'Recommended Marine Life' : 'Recommended Freshwater Inhabitants'}
            </h3>
            <RecommendationCarousel items={inhabitantRecommendations} />
          </div>
        )}
        
        {filteredEquipmentRecommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isSaltwaterType ? 'Recommended Saltwater Equipment' : 'Recommended Freshwater Equipment'}
            </h3>
            <RecommendationCarousel items={filteredEquipmentRecommendations} />
          </div>
        )}

        {inhabitantRecommendations.length === 0 && filteredEquipmentRecommendations.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No recommendations available for this tank type.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
