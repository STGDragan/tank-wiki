
import { Card, CardContent } from "@/components/ui/card";
import { CreateTankDialog } from "./CreateTankDialog";
import { Fish } from "lucide-react";

interface EmptyStateProps {
  aquariumCount: number;
}

export function EmptyState({ aquariumCount }: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Fish className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No aquariums yet!</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Click the button above to get started and create your first aquarium.
        </p>
        <CreateTankDialog aquariumCount={aquariumCount} />
      </CardContent>
    </Card>
  );
}
