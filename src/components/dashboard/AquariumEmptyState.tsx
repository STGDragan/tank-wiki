import { Card, CardContent } from "@/components/ui/card";
import { Fish } from "lucide-react";
import { AquariumSetupWizard } from "@/components/wizard/AquariumSetupWizard";

export const AquariumEmptyState = () => {
  return (
    <Card className="bg-card border-2 border-primary/50 rounded-xl">
      <CardContent className="text-center py-8">
        <Fish className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2 text-card-foreground">No aquariums yet</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first aquarium
        </p>
        <AquariumSetupWizard aquariumCount={0} />
      </CardContent>
    </Card>
  );
};