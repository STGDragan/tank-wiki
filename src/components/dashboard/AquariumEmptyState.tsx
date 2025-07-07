import { Card, CardContent } from "@/components/ui/card";
import { Fish } from "lucide-react";
import { AquariumSetupWizard } from "@/components/wizard/AquariumSetupWizard";

export const AquariumEmptyState = () => {
  return (
    <Card className="bg-gray-800 border-2 border-cyan-500/50 rounded-xl">
      <CardContent className="text-center py-8">
        <Fish className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2 text-white">No aquariums yet</h3>
        <p className="text-gray-400 mb-4">
          Get started by creating your first aquarium
        </p>
        <AquariumSetupWizard aquariumCount={0} />
      </CardContent>
    </Card>
  );
};