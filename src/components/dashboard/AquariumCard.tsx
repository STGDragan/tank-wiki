import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TankHealthIndicator } from "@/components/aquarium/TankHealthIndicator";

interface AquariumCardProps {
  aquarium: {
    id: string;
    name: string;
    type: string | null;
    size: number | null;
    image_url: string | null;
    created_at: string;
  };
  tankHealthData?: {
    waterParameters: any[];
    maintenance: any[];
    livestock: any[];
    equipment: any[];
  };
  onDelete: (id: string) => void;
}

export const AquariumCard = ({ aquarium, tankHealthData, onDelete }: AquariumCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-card border-2 border-primary/50 rounded-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-card-foreground text-lg">{aquarium.name}</CardTitle>
            <p className="text-muted-foreground text-sm">
              Started on {new Date(aquarium.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(aquarium.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tankHealthData && (
          <TankHealthIndicator
            waterParameters={tankHealthData.waterParameters}
            maintenanceTasks={tankHealthData.maintenance}
            livestock={tankHealthData.livestock}
            equipment={tankHealthData.equipment}
            aquariumType={aquarium.type}
            aquariumSize={aquarium.size}
            compact={true}
          />
        )}
        
        {aquarium.image_url && (
          <div className="w-full h-32 rounded-lg overflow-hidden">
            <img
              src={aquarium.image_url}
              alt={aquarium.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <Button
          onClick={() => navigate(`/aquarium/${aquarium.id}`)}
          className="w-full bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};