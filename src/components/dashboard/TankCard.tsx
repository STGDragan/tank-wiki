
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Settings, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Aquarium } from "@/hooks/useAquariums";
import { TankHealthIndicator } from "@/components/aquarium/TankHealthIndicator";

interface TankCardProps {
  aquarium: Aquarium;
  onDelete: (id: string) => void;
  healthData?: {
    waterParameters?: any[];
    maintenanceTasks?: any[];
    livestock?: any[];
    equipment?: any[];
  };
}

export function TankCard({ aquarium, onDelete, healthData }: TankCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-blue-50/30 border-blue-100 hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg text-gray-900">{aquarium.name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {aquarium.type && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  {aquarium.type}
                </Badge>
              )}
              {aquarium.size && (
                <Badge variant="outline" className="text-xs">
                  {aquarium.size} gal
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(aquarium.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tank Health Indicator */}
        <TankHealthIndicator
          waterParameters={healthData?.waterParameters}
          maintenanceTasks={healthData?.maintenanceTasks}
          livestock={healthData?.livestock}
          equipment={healthData?.equipment}
          aquariumType={aquarium.type}
          aquariumSize={aquarium.size}
          compact={true}
          className="mb-3"
        />

        {aquarium.image_url && (
          <div className="w-full h-32 rounded-lg overflow-hidden">
            <img 
              src={aquarium.image_url} 
              alt={aquarium.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Link to={`/aquariums/${aquarium.id}`} className="flex items-center justify-center gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
