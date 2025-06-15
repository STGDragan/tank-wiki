
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saltwaterRecommendations, freshwaterRecommendations, Recommendation } from "@/data/recommendations";
import RecommendationTabs from "../recommendations/RecommendationTabs";

interface AquariumRecommendationsProps {
  aquariumType: string | null | undefined;
}

export function AquariumRecommendations({ aquariumType }: AquariumRecommendationsProps) {
  let recommendations: Recommendation[] = [];
  
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
    recommendations = saltwaterRecommendations;
  } else if (isFreshwaterType) {
    recommendations = freshwaterRecommendations;
  }

  if (recommendations.length === 0) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations For You</CardTitle>
      </CardHeader>
      <CardContent>
        <RecommendationTabs recommendations={recommendations} />
      </CardContent>
    </Card>
  );
}
