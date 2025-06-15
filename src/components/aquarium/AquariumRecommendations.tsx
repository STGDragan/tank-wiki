
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saltwaterRecommendations, freshwaterRecommendations, Recommendation } from "@/data/recommendations";
import RecommendationTabs from "../recommendations/RecommendationTabs";

interface AquariumRecommendationsProps {
  aquariumType: string | null | undefined;
}

export function AquariumRecommendations({ aquariumType }: AquariumRecommendationsProps) {
  let recommendations: Recommendation[] = [];
  const lowercasedType = aquariumType?.toLowerCase();

  if (lowercasedType === 'saltwater') {
    recommendations = saltwaterRecommendations;
  } else if (lowercasedType === 'freshwater') {
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
                    Set an aquarium type (freshwater or saltwater) to see recommendations.
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
