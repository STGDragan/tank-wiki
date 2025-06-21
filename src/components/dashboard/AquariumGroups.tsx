
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTankDialog } from "./CreateTankDialog";
import { AquariumSetupWizard } from "../wizard/AquariumSetupWizard";
import { TankCard } from "./TankCard";
import { Aquarium } from "@/hooks/useAquariums";

interface AquariumGroupsProps {
  aquariums: Aquarium[];
  onDeleteAquarium: (id: string) => void;
  aquariumCount: number;
}

export function AquariumGroups({ aquariums, onDeleteAquarium, aquariumCount }: AquariumGroupsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Your Aquariums</CardTitle>
          <div className="flex gap-2">
            <AquariumSetupWizard aquariumCount={aquariumCount} />
            <CreateTankDialog aquariumCount={aquariumCount} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {aquariums.map((aquarium) => (
            <TankCard
              key={aquarium.id}
              id={aquarium.id}
              name={aquarium.name}
              type={aquarium.type || 'Unknown'}
              size={aquarium.size || 0}
              image_url={aquarium.image_url}
              onDelete={onDeleteAquarium}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
