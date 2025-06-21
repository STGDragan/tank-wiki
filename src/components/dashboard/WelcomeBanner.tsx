
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
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Welcome to TankWiki — Let's Set Up Your First Aquarium
            </h2>
            <p className="text-muted-foreground text-lg">
              You can track water tests, manage equipment, and share your progress.
            </p>
          </div>
          <CreateTankDialog 
            aquariumCount={aquariumCount} 
            trigger={
              <Button size="lg" className="font-semibold">
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
