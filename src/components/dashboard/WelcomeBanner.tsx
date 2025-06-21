
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateTankDialog } from "./CreateTankDialog";
import { Plus } from "lucide-react";

interface WelcomeBannerProps {
  aquariumCount: number;
}

export function WelcomeBanner({ aquariumCount }: WelcomeBannerProps) {
  if (aquariumCount > 0) return null;

  return (
    <Card className="aquatic-gradient text-white border-0 shadow-aquatic">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-3">
              Welcome to TankWiki — Let's Set Up Your First Aquarium
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              You can track water tests, manage equipment, and share your progress.
            </p>
          </div>
          <CreateTankDialog 
            aquariumCount={aquariumCount} 
            trigger={
              <Button size="lg" className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 hover:scale-105 shadow-lg font-medium">
                <Plus className="h-5 w-5 mr-2" />
                Add Aquarium
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
