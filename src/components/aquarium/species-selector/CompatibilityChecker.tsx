
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Skull, Shield, Info } from 'lucide-react';
import { getDetailedFishInfo } from '@/data/species/detailedFishData';
import { getDetailedFreshwaterFishInfo } from '@/data/species/detailedFreshwaterFishData';

interface CompatibilityIssue {
  type: 'aggression' | 'predation' | 'schooling' | 'tank_size' | 'water_type' | 'care_level' | 'territorial';
  severity: 'warning' | 'error' | 'info';
  species: string[];
  message: string;
  icon: React.ReactNode;
}

interface CompatibilityCheckerProps {
  selectedSpecies: string[];
  aquariumType: string | null;
}

export function CompatibilityChecker({ selectedSpecies, aquariumType }: CompatibilityCheckerProps) {
  const [issues, setIssues] = useState<CompatibilityIssue[]>([]);

  useEffect(() => {
    if (selectedSpecies.length < 2) {
      setIssues([]);
      return;
    }

    const detectedIssues: CompatibilityIssue[] = [];
    const speciesData = selectedSpecies.map(species => {
      const marineInfo = getDetailedFishInfo(species);
      const freshwaterInfo = getDetailedFreshwaterFishInfo(species);
      return {
        name: species,
        info: marineInfo || freshwaterInfo,
        type: marineInfo ? 'marine' : 'freshwater'
      };
    });

    // Check for water type compatibility (saltwater vs freshwater)
    const marineSpecies = speciesData.filter(s => s.type === 'marine').map(s => s.name);
    const freshwaterSpecies = speciesData.filter(s => s.type === 'freshwater').map(s => s.name);
    
    if (marineSpecies.length > 0 && freshwaterSpecies.length > 0) {
      detectedIssues.push({
        type: 'water_type',
        severity: 'error',
        species: [...marineSpecies, ...freshwaterSpecies],
        message: `You cannot mix saltwater and freshwater species in the same tank. Separate these species: Saltwater (${marineSpecies.join(', ')}) and Freshwater (${freshwaterSpecies.join(', ')})`,
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    // Check for aggressive species
    const aggressiveSpecies = speciesData.filter(s => 
      s.info?.tags?.includes('aggressive') || 
      s.info?.tags?.includes('predatory') || 
      s.info?.difficulty === 'Advanced'
    );

    if (aggressiveSpecies.length > 0) {
      const aggressiveNames = aggressiveSpecies.map(s => s.name);
      const otherSpecies = selectedSpecies.filter(s => !aggressiveNames.includes(s));
      
      if (otherSpecies.length > 0) {
        detectedIssues.push({
          type: 'aggression',
          severity: 'warning',
          species: aggressiveNames,
          message: `Aggressive species detected: ${aggressiveNames.join(', ')}. These may attack or stress other tankmates.`,
          icon: <Skull className="h-4 w-4" />
        });
      }
    }

    // Check for predatory relationships
    const predatorySpecies = speciesData.filter(s => 
      s.info?.tags?.includes('predatory') || 
      s.info?.tank_mate_issues?.toLowerCase().includes('eat') ||
      s.info?.tank_mate_issues?.toLowerCase().includes('predator')
    );

    if (predatorySpecies.length > 0) {
      predatorySpecies.forEach(predator => {
        const vulnerableSpecies = speciesData.filter(s => 
          s.name !== predator.name && 
          (s.info?.max_size || 0) < (predator.info?.max_size || 0) / 2
        );

        if (vulnerableSpecies.length > 0) {
          detectedIssues.push({
            type: 'predation',
            severity: 'error',
            species: [predator.name, ...vulnerableSpecies.map(v => v.name)],
            message: `${predator.name} may eat smaller tankmates: ${vulnerableSpecies.map(v => v.name).join(', ')}`,
            icon: <Skull className="h-4 w-4" />
          });
        }
      });
    }

    // Check for schooling fish
    const schoolingSpecies = speciesData.filter(s => 
      s.info?.tags?.includes('schooling') || 
      s.info?.compatibility_notes?.toLowerCase().includes('school') ||
      s.info?.tank_mate_issues?.toLowerCase().includes('group')
    );

    schoolingSpecies.forEach(schooler => {
      const sameSpeciesCount = selectedSpecies.filter(s => s === schooler.name).length;
      if (sameSpeciesCount === 1) {
        detectedIssues.push({
          type: 'schooling',
          severity: 'warning',
          species: [schooler.name],
          message: `${schooler.name} is a schooling fish and should be kept in groups of 6+ for their wellbeing.`,
          icon: <Users className="h-4 w-4" />
        });
      }
    });

    // Check for territorial species
    const territorialSpecies = speciesData.filter(s => 
      s.info?.tags?.includes('territorial') || 
      s.info?.compatibility_notes?.toLowerCase().includes('territorial')
    );

    if (territorialSpecies.length > 1) {
      detectedIssues.push({
        type: 'territorial',
        severity: 'warning',
        species: territorialSpecies.map(s => s.name),
        message: `Multiple territorial species detected: ${territorialSpecies.map(s => s.name).join(', ')}. Consider only one territorial species per tank.`,
        icon: <Shield className="h-4 w-4" />
      });
    }

    // Check tank size requirements
    const largeSpecies = speciesData.filter(s => (s.info?.min_tank_size || 0) > 75);
    if (largeSpecies.length > 0) {
      detectedIssues.push({
        type: 'tank_size',
        severity: 'info',
        species: largeSpecies.map(s => s.name),
        message: `Large tank requirements: ${largeSpecies.map(s => `${s.name} (${s.info?.min_tank_size}+ gal)`).join(', ')}`,
        icon: <Info className="h-4 w-4" />
      });
    }

    setIssues(detectedIssues);
  }, [selectedSpecies, aquariumType]);

  if (issues.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-800 dark:text-red-200';
      case 'warning': return 'text-yellow-800 dark:text-yellow-200';
      case 'info': return 'text-blue-800 dark:text-blue-200';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        Compatibility Analysis
      </h4>
      
      {issues.map((issue, index) => (
        <Alert key={index} className={`${getSeverityColor(issue.severity)} border-l-4`}>
          <div className="flex items-start gap-3">
            <div className={getSeverityTextColor(issue.severity)}>
              {issue.icon}
            </div>
            <div className="flex-1">
              <AlertDescription className={`${getSeverityTextColor(issue.severity)} text-sm`}>
                {issue.message}
              </AlertDescription>
              <div className="flex flex-wrap gap-1 mt-2">
                {issue.species.map(species => (
                  <Badge key={species} variant="outline" className="text-xs">
                    {species}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
