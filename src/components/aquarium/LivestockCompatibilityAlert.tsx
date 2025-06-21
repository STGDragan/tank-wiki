
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Skull, Shield } from 'lucide-react';
import { CompatibilityChecker } from './species-selector/CompatibilityChecker';
import { Tables } from '@/integrations/supabase/types';

type Livestock = Tables<'livestock'>;

interface LivestockCompatibilityAlertProps {
  livestock: Livestock[];
  aquariumType: string | null;
}

export function LivestockCompatibilityAlert({ livestock, aquariumType }: LivestockCompatibilityAlertProps) {
  const species = livestock.map(l => l.species);
  
  if (species.length < 2) {
    return null;
  }

  return (
    <div className="mb-4">
      <CompatibilityChecker 
        selectedSpecies={species}
        aquariumType={aquariumType}
      />
    </div>
  );
}
