
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Calendar } from 'lucide-react';

type Medication = Tables<'medications'>;

interface MedicationCardProps {
  medication: Medication;
}

export const MedicationCard = ({ medication }: MedicationCardProps) => {
  const isActive = medication.end_date ? new Date(medication.end_date) >= new Date() : true;
  const hasEnded = medication.end_date && new Date(medication.end_date) < new Date();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-lg">{medication.name}</CardTitle>
        </div>
        <Badge variant={isActive ? "default" : "secondary"}>
          {hasEnded ? "Completed" : isActive ? "Active" : "Scheduled"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {medication.dosage && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Dosage: </span>
            <span className="text-sm">{medication.dosage}</span>
          </div>
        )}
        
        {medication.frequency && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Frequency: </span>
            <span className="text-sm">{medication.frequency}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Started: {format(new Date(medication.start_date), 'PP')}</span>
          </div>
          {medication.end_date && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Ends: {format(new Date(medication.end_date), 'PP')}</span>
            </div>
          )}
        </div>
        
        {medication.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{medication.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
