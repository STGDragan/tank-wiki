
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Droplets, 
  Fish, 
  Settings, 
  CheckCircle, 
  FileText,
  Trash2,
  Camera
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type TimelineEntry = Tables<'aquarium_timeline'>;
type WaterParameterReading = Tables<'water_parameters'>;
type Livestock = Tables<'livestock'>;
type Equipment = Tables<'equipment'>;
type MaintenanceTask = Tables<'maintenance'>;

interface EnhancedTimelineEntryProps {
  entry: TimelineEntry;
  waterTest?: WaterParameterReading;
  livestock?: Livestock;
  equipment?: Equipment;
  task?: MaintenanceTask;
  onDelete?: (entryId: string) => void;
  canEdit?: boolean;
}

const getEntryIcon = (type: string) => {
  switch (type) {
    case 'water_test':
      return <Droplets className="h-4 w-4 text-blue-500" />;
    case 'livestock_add':
      return <Fish className="h-4 w-4 text-green-500" />;
    case 'equipment_add':
      return <Settings className="h-4 w-4 text-purple-500" />;
    case 'maintenance':
      return <CheckCircle className="h-4 w-4 text-orange-500" />;
    case 'note':
      return <FileText className="h-4 w-4 text-gray-500" />;
    case 'image':
      return <Camera className="h-4 w-4 text-pink-500" />;
    default:
      return <Calendar className="h-4 w-4 text-gray-400" />;
  }
};

const getEntryColor = (type: string) => {
  switch (type) {
    case 'water_test':
      return 'bg-blue-50 border-blue-200';
    case 'livestock_add':
      return 'bg-green-50 border-green-200';
    case 'equipment_add':
      return 'bg-purple-50 border-purple-200';
    case 'maintenance':
      return 'bg-orange-50 border-orange-200';
    case 'note':
      return 'bg-gray-50 border-gray-200';
    case 'image':
      return 'bg-pink-50 border-pink-200';
    default:
      return 'bg-white border-gray-200';
  }
};

export function EnhancedTimelineEntry({
  entry,
  waterTest,
  livestock,
  equipment,
  task,
  onDelete,
  canEdit = false
}: EnhancedTimelineEntryProps) {
  const entryType = entry.title.toLowerCase().includes('water') ? 'water_test' :
                   entry.title.toLowerCase().includes('added') && livestock ? 'livestock_add' :
                   entry.title.toLowerCase().includes('installed') && equipment ? 'equipment_add' :
                   entry.title.toLowerCase().includes('maintenance') ? 'maintenance' :
                   entry.image_url ? 'image' : 'note';

  return (
    <Card className={`${getEntryColor(entryType)} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-white shadow-sm">
            {getEntryIcon(entryType)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900">
                  {entry.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(entry.created_at), 'h:mm a')}
                  </span>
                </div>
              </div>
              
              {canEdit && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(entry.id)}
                  className="opacity-60 hover:opacity-100 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {entry.description && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {entry.description}
              </p>
            )}

            {/* Water Test Details */}
            {waterTest && entryType === 'water_test' && (
              <div className="mt-3 p-3 bg-white/70 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {waterTest.temperature && (
                    <div>Temp: {waterTest.temperature}°F</div>
                  )}
                  {waterTest.ph && (
                    <div>pH: {waterTest.ph}</div>
                  )}
                  {waterTest.ammonia !== null && (
                    <div className={waterTest.ammonia > 0 ? 'text-red-600 font-medium' : ''}>
                      Ammonia: {waterTest.ammonia}
                    </div>
                  )}
                  {waterTest.nitrite !== null && (
                    <div className={waterTest.nitrite > 0 ? 'text-red-600 font-medium' : ''}>
                      Nitrite: {waterTest.nitrite}
                    </div>
                  )}
                  {waterTest.nitrate !== null && (
                    <div className={waterTest.nitrate > 40 ? 'text-yellow-600 font-medium' : ''}>
                      Nitrate: {waterTest.nitrate}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Livestock Details */}
            {livestock && entryType === 'livestock_add' && (
              <div className="mt-3 p-3 bg-white/70 rounded-lg">
                <div className="text-xs">
                  <div><span className="font-medium">Species:</span> {livestock.species}</div>
                  <div><span className="font-medium">Quantity:</span> {livestock.quantity}</div>
                  {livestock.name && (
                    <div><span className="font-medium">Name:</span> {livestock.name}</div>
                  )}
                </div>
              </div>
            )}

            {/* Equipment Details */}
            {equipment && entryType === 'equipment_add' && (
              <div className="mt-3 p-3 bg-white/70 rounded-lg">
                <div className="text-xs">
                  <div><span className="font-medium">Type:</span> {equipment.type}</div>
                  {equipment.brand && (
                    <div><span className="font-medium">Brand:</span> {equipment.brand}</div>
                  )}
                  {equipment.model && (
                    <div><span className="font-medium">Model:</span> {equipment.model}</div>
                  )}
                </div>
              </div>
            )}
            
            {entry.image_url && (
              <div className="mt-3">
                <img 
                  src={entry.image_url} 
                  alt={entry.title}
                  className="rounded-lg max-w-xs max-h-48 object-cover shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
