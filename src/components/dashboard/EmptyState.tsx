
import { Card, CardContent } from "@/components/ui/card";
import { CreateTankDialog } from "./CreateTankDialog";
import { AquariumSetupWizard } from "../wizard/AquariumSetupWizard";
import { Fish } from "lucide-react";

interface EmptyStateProps {
  aquariumCount: number;
}

export function EmptyState({ aquariumCount }: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-6 shadow-soft">
          <Fish className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold mb-3 text-slate-800">No aquariums yet!</h3>
        <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
          Get started with your first aquarium using our setup wizard, or create one manually.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <AquariumSetupWizard aquariumCount={aquariumCount} />
          <CreateTankDialog aquariumCount={aquariumCount} />
        </div>
      </CardContent>
    </Card>
  );
}
