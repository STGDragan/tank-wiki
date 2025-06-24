
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';

type WaterParameterReading = Tables<'water_parameters'> & {
    salinity?: number | null;
    alkalinity?: number | null;
    calcium?: number | null;
    magnesium?: number | null;
};

interface WaterParameterCardProps {
  reading: WaterParameterReading;
  aquariumType: string | null;
  onDelete?: () => void;
}

const getParameterStatus = (value: number | null, parameter: string, aquariumType: string | null) => {
  if (value === null) return 'unknown';
  
  // Define ideal ranges based on aquarium type
  const ranges: Record<string, { min?: number; max?: number }> = {};
  
  const isSaltwater = aquariumType?.includes('Saltwater') || aquariumType?.includes('Reef');
  const isReef = aquariumType?.includes('Reef');
  
  if (isSaltwater) {
    ranges.temperature = { min: 76, max: 80 };
    ranges.ph = { min: 8.1, max: 8.4 };
    ranges.salinity = { min: 1.023, max: 1.026 };
    ranges.alkalinity = { min: 8, max: 12 };
    if (isReef) {
      ranges.calcium = { min: 400, max: 450 };
      ranges.magnesium = { min: 1250, max: 1350 };
      ranges.nitrate = { min: 0, max: 5 };
      ranges.phosphate = { min: 0, max: 0.03 };
    } else {
      ranges.nitrate = { min: 0, max: 20 };
    }
  } else {
    ranges.temperature = { min: 72, max: 78 };
    ranges.ph = { min: 6.5, max: 7.8 };
    ranges.nitrate = { min: 0, max: 40 };
  }
  
  ranges.ammonia = { min: 0, max: 0 };
  ranges.nitrite = { min: 0, max: 0 };
  
  const range = ranges[parameter];
  if (!range) return 'unknown';
  
  if (range.min !== undefined && value < range.min) return 'low';
  if (range.max !== undefined && value > range.max) return 'high';
  return 'good';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'good': return <CheckCircle className="h-3 w-3 text-green-600" />;
    case 'high':
    case 'low': return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
    default: return <Info className="h-3 w-3 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good': return 'text-green-600 dark:text-green-400';
    case 'high':
    case 'low': return 'text-yellow-600 dark:text-yellow-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};

export const WaterParameterCard = ({ reading, aquariumType, onDelete }: WaterParameterCardProps) => {
  const isSaltwater = aquariumType?.toLowerCase().includes('saltwater') || aquariumType?.toLowerCase().includes('reef');

  const parameters = [
    { key: 'temperature', label: 'Temp', unit: '°F', value: reading.temperature },
    { key: 'ph', label: 'pH', unit: '', value: reading.ph },
    { key: 'ammonia', label: 'Ammonia', unit: 'ppm', value: reading.ammonia },
    { key: 'nitrite', label: 'Nitrite', unit: 'ppm', value: reading.nitrite },
    { key: 'nitrate', label: 'Nitrate', unit: 'ppm', value: reading.nitrate },
    ...(isSaltwater ? [
      { key: 'salinity', label: 'Salinity', unit: 'ppt', value: reading.salinity },
      { key: 'alkalinity', label: 'Alkalinity', unit: 'dKH', value: reading.alkalinity },
      { key: 'calcium', label: 'Calcium', unit: 'ppm', value: reading.calcium },
      { key: 'magnesium', label: 'Magnesium', unit: 'ppm', value: reading.magnesium },
    ] : [])
  ];

  const criticalIssues = parameters.filter(param => {
    const status = getParameterStatus(param.value, param.key, aquariumType);
    return status === 'high' || status === 'low';
  }).length;

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-md ${criticalIssues > 0 ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' : 'border-green-300 bg-green-50 dark:bg-green-900/10'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <span>Reading</span>
            {criticalIssues > 0 ? (
              <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {criticalIssues} Alert{criticalIssues > 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge variant="default" className="bg-green-600 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Good
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{format(new Date(reading.recorded_at), 'PPP, p')}</p>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        {parameters.map((param) => {
          const status = getParameterStatus(param.value, param.key, aquariumType);
          return (
            <div key={param.key} className="flex items-center justify-between">
              <span className="font-medium">{param.label}:</span>
              <div className="flex items-center space-x-1">
                <span className={getStatusColor(status)}>
                  {param.value ?? 'N/A'}{param.value ? ` ${param.unit}` : ''}
                </span>
                {getStatusIcon(status)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
