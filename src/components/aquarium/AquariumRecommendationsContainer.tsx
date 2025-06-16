
import { AquariumRecommendations } from "./AquariumRecommendations";
import { useAquariumData } from "@/hooks/useAquariumData";

interface AquariumRecommendationsContainerProps {
  aquariumId: string;
  aquariumType: string | null | undefined;
  userId: string | undefined;
}

export function AquariumRecommendationsContainer({ 
  aquariumId, 
  aquariumType, 
  userId 
}: AquariumRecommendationsContainerProps) {
  const { equipment } = useAquariumData(aquariumId, userId);

  const existingEquipment = equipment?.map(item => ({
    type: item.type,
    brand: item.brand,
    model: item.model
  })) || [];

  return (
    <AquariumRecommendations 
      aquariumType={aquariumType} 
      existingEquipment={existingEquipment}
    />
  );
}
