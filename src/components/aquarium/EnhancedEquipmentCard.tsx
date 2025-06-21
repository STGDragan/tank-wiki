
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, Settings } from 'lucide-react';
import { EquipmentDetailsDialog } from './EquipmentDetailsDialog';

type Equipment = Tables<'equipment'>;

interface EnhancedEquipmentCardProps {
  equipment: Equipment;
  onDelete: (equipmentId: string) => void;
}

export const EnhancedEquipmentCard = ({ equipment, onDelete }: EnhancedEquipmentCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <Card className="relative hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setIsDetailsOpen(true)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {equipment.type}
                </h3>
                {(equipment.brand || equipment.model) && (
                  <p className="text-sm text-muted-foreground">
                    {equipment.brand} {equipment.model}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="shrink-0">
                <Package className="h-3 w-3 mr-1" />
                Equipment
              </Badge>
            </div>

            {equipment.image_url && (
              <div className="w-full h-32 rounded-md overflow-hidden">
                <img 
                  src={equipment.image_url} 
                  alt={equipment.type}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {equipment.installed_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Installed: {new Date(equipment.installed_at).toLocaleDateString()}</span>
              </div>
            )}

            {equipment.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {equipment.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <EquipmentDetailsDialog
        equipment={equipment}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onDelete={onDelete}
      />
    </>
  );
};
