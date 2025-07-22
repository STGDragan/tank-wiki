import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpeciesSelector } from '@/components/aquarium/SpeciesSelector';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Info, Fish, Heart, Skull, Shield, Users } from 'lucide-react';
import { getDetailedFishInfo } from '@/data/species/detailedFishData';
import { getDetailedFreshwaterFishInfo } from '@/data/species/detailedFreshwaterFishData';
import { getAllSpecies } from '@/data/species';

interface CompatibilityResult {
  species: string;
  compatibility: 'excellent' | 'good' | 'caution' | 'incompatible';
  reason: string;
  details: string;
  icon: React.ReactNode;
}

const getCompatibilityIcon = (compatibility: string) => {
  switch (compatibility) {
    case 'excellent': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'caution': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'incompatible': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const getCompatibilityColor = (compatibility: string) => {
  switch (compatibility) {
    case 'excellent': return 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20';
    case 'good': return 'border-green-500/30 bg-green-50 dark:bg-green-950/20';
    case 'caution': return 'border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20';
    case 'incompatible': return 'border-red-500/30 bg-red-50 dark:bg-red-950/20';
    default: return 'border-gray-500/30 bg-gray-50 dark:bg-gray-950/20';
  }
};

const analyzeCompatibility = (selectedSpecies: string, potentialTankmate: string): CompatibilityResult => {
  const selectedInfo = getDetailedFishInfo(selectedSpecies) || getDetailedFreshwaterFishInfo(selectedSpecies);
  const tankmateInfo = getDetailedFishInfo(potentialTankmate) || getDetailedFreshwaterFishInfo(potentialTankmate);

  // Water type compatibility check
  const selectedType = getDetailedFishInfo(selectedSpecies) ? 'marine' : 'freshwater';
  const tankmateType = getDetailedFishInfo(potentialTankmate) ? 'marine' : 'freshwater';
  
  if (selectedType !== tankmateType) {
    return {
      species: potentialTankmate,
      compatibility: 'incompatible',
      reason: 'Water Type Mismatch',
      details: `${selectedSpecies} requires ${selectedType} water while ${potentialTankmate} requires ${tankmateType} water. They cannot coexist in the same tank.`,
      icon: <XCircle className="h-4 w-4 text-red-500" />
    };
  }

  // Aggression and predation checks
  const selectedAggressive = selectedInfo?.tags?.includes('aggressive') || selectedInfo?.tags?.includes('predatory');
  const tankmateAggressive = tankmateInfo?.tags?.includes('aggressive') || tankmateInfo?.tags?.includes('predatory');
  
  if (selectedAggressive || tankmateAggressive) {
    const aggressiveSpecies = selectedAggressive ? selectedSpecies : potentialTankmate;
    return {
      species: potentialTankmate,
      compatibility: 'incompatible',
      reason: 'Aggression Risk',
      details: `${aggressiveSpecies} is known to be aggressive or predatory and may attack, stress, or consume tankmates. Consider housing aggressive species alone or with similarly aggressive fish.`,
      icon: <Skull className="h-4 w-4 text-red-500" />
    };
  }

  // Size compatibility
  const selectedSize = selectedInfo?.max_size || 0;
  const tankmateSize = tankmateInfo?.max_size || 0;
  
  if (selectedSize > tankmateSize * 2 || tankmateSize > selectedSize * 2) {
    const largerSpecies = selectedSize > tankmateSize ? selectedSpecies : potentialTankmate;
    const smallerSpecies = selectedSize > tankmateSize ? potentialTankmate : selectedSpecies;
    return {
      species: potentialTankmate,
      compatibility: 'caution',
      reason: 'Size Difference',
      details: `${largerSpecies} (${Math.max(selectedSize, tankmateSize)}" max) is significantly larger than ${smallerSpecies} (${Math.min(selectedSize, tankmateSize)}" max). Monitor closely as larger fish may intimidate or accidentally harm smaller tankmates.`,
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />
    };
  }

  // Territorial behavior
  const selectedTerritorial = selectedInfo?.tags?.includes('territorial');
  const tankmateTerritorial = tankmateInfo?.tags?.includes('territorial');
  
  if (selectedTerritorial && tankmateTerritorial) {
    return {
      species: potentialTankmate,
      compatibility: 'caution',
      reason: 'Both Territorial',
      details: `Both ${selectedSpecies} and ${potentialTankmate} are territorial species. They may compete for space and establish conflicting territories. Provide plenty of hiding spots and ensure adequate tank size.`,
      icon: <Shield className="h-4 w-4 text-yellow-500" />
    };
  }

  // Schooling fish compatibility
  const selectedSchooling = selectedInfo?.tags?.includes('schooling');
  const tankmateSchooling = tankmateInfo?.tags?.includes('schooling');
  
  if (selectedSchooling && tankmateSchooling) {
    return {
      species: potentialTankmate,
      compatibility: 'excellent',
      reason: 'Schooling Compatibility',
      details: `Both ${selectedSpecies} and ${potentialTankmate} are schooling fish that prefer group environments. They will likely coexist peacefully and may even school together if similar in size and behavior.`,
      icon: <Users className="h-4 w-4 text-emerald-500" />
    };
  }

  // Reef safe compatibility (for marine fish)
  if (selectedType === 'marine') {
    const selectedReefSafe = selectedInfo?.tags?.includes('reef safe');
    const tankmateReefSafe = tankmateInfo?.tags?.includes('reef safe');
    
    if (selectedReefSafe && tankmateReefSafe) {
      return {
        species: potentialTankmate,
        compatibility: 'excellent',
        reason: 'Reef Safe Compatibility',
        details: `Both ${selectedSpecies} and ${potentialTankmate} are reef safe species that won't harm corals or invertebrates. They typically have peaceful temperaments suitable for community tanks.`,
        icon: <Heart className="h-4 w-4 text-emerald-500" />
      };
    }
  }

  // Difficulty level compatibility
  const selectedDifficulty = selectedInfo?.difficulty;
  const tankmateDifficulty = tankmateInfo?.difficulty;
  
  if (selectedDifficulty === 'Beginner' && tankmateDifficulty === 'Beginner') {
    return {
      species: potentialTankmate,
      compatibility: 'good',
      reason: 'Beginner Friendly',
      details: `Both ${selectedSpecies} and ${potentialTankmate} are beginner-friendly species with similar care requirements. They are generally hardy and adaptable to various tank conditions.`,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    };
  }

  // Default compatibility based on temperament
  if (!selectedAggressive && !tankmateAggressive && !selectedTerritorial && !tankmateTerritorial) {
    return {
      species: potentialTankmate,
      compatibility: 'good',
      reason: 'Peaceful Temperaments',
      details: `${selectedSpecies} and ${potentialTankmate} both have peaceful temperaments with no known aggressive behaviors. They should coexist well in a properly maintained community tank.`,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    };
  }

  return {
    species: potentialTankmate,
    compatibility: 'caution',
    reason: 'Limited Information',
    details: `Limited compatibility data available for this pairing. Research both species thoroughly and monitor behavior closely if housing together.`,
    icon: <Info className="h-4 w-4 text-gray-500" />
  };
};

const Compatibility = () => {
  const [selectedSpecies, setSelectedSpecies] = useState('');
  
  const selectedInfo = selectedSpecies ? 
    (getDetailedFishInfo(selectedSpecies) || getDetailedFreshwaterFishInfo(selectedSpecies)) : null;
  
  const waterType = selectedSpecies ? 
    (getDetailedFishInfo(selectedSpecies) ? 'marine' : 'freshwater') : null;
  
  const relevantSpecies = selectedSpecies ? 
    getAllSpecies().filter(species => {
      const isSelectedMarine = getDetailedFishInfo(selectedSpecies);
      const isSpeciesMarine = getDetailedFishInfo(species);
      return species !== selectedSpecies && (isSelectedMarine === isSpeciesMarine);
    }) : [];

  const compatibilityResults = relevantSpecies.map(species => 
    analyzeCompatibility(selectedSpecies, species)
  );

  const excellentMatches = compatibilityResults.filter(r => r.compatibility === 'excellent');
  const goodMatches = compatibilityResults.filter(r => r.compatibility === 'good');
  const cautionMatches = compatibilityResults.filter(r => r.compatibility === 'caution');
  const incompatibleMatches = compatibilityResults.filter(r => r.compatibility === 'incompatible');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="h-5 w-5" />
            Species Compatibility Analyzer
          </CardTitle>
          <p className="text-muted-foreground">
            Select a species to discover compatible and incompatible tankmates with detailed explanations.
          </p>
        </CardHeader>
        <CardContent>
          <SpeciesSelector
            value={selectedSpecies}
            onChange={setSelectedSpecies}
            aquariumType={waterType}
            showDetailsCard={false}
          />
        </CardContent>
      </Card>

      {selectedSpecies && selectedInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedSpecies} - Compatibility Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Water Type</p>
                <Badge variant="outline" className="capitalize">
                  {waterType}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                <Badge variant="outline">
                  {selectedInfo.difficulty || 'Unknown'}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Max Size</p>
                <Badge variant="outline">
                  {selectedInfo.max_size ? `${selectedInfo.max_size}"` : 'Unknown'}
                </Badge>
              </div>
            </div>
            
            {selectedInfo.tags && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Characteristics</p>
                <div className="flex flex-wrap gap-2">
                  {selectedInfo.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedSpecies && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compatible Species */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Compatible Tankmates
            </h3>
            
            {excellentMatches.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Excellent Matches</h4>
                {excellentMatches.map((result, index) => (
                  <Alert key={index} className={getCompatibilityColor(result.compatibility)}>
                    <div className="flex items-start gap-3">
                      {result.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.species}</span>
                          <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-700 dark:text-emerald-300">
                            {result.reason}
                          </Badge>
                        </div>
                        <AlertDescription className="text-sm">
                          {result.details}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {goodMatches.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Good Matches</h4>
                {goodMatches.slice(0, 10).map((result, index) => (
                  <Alert key={index} className={getCompatibilityColor(result.compatibility)}>
                    <div className="flex items-start gap-3">
                      {result.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.species}</span>
                          <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-300">
                            {result.reason}
                          </Badge>
                        </div>
                        <AlertDescription className="text-sm">
                          {result.details}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
                {goodMatches.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center">
                    And {goodMatches.length - 10} more compatible species...
                  </p>
                )}
              </div>
            )}

            {excellentMatches.length === 0 && goodMatches.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No highly compatible tankmates found. Check the caution list for species that may work with careful planning.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Incompatible Species */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Incompatible & Caution
            </h3>

            {incompatibleMatches.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Avoid These Species</h4>
                {incompatibleMatches.slice(0, 8).map((result, index) => (
                  <Alert key={index} className={getCompatibilityColor(result.compatibility)}>
                    <div className="flex items-start gap-3">
                      {result.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.species}</span>
                          <Badge variant="outline" className="text-xs border-red-500 text-red-700 dark:text-red-300">
                            {result.reason}
                          </Badge>
                        </div>
                        <AlertDescription className="text-sm">
                          {result.details}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {cautionMatches.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Use Caution</h4>
                {cautionMatches.slice(0, 8).map((result, index) => (
                  <Alert key={index} className={getCompatibilityColor(result.compatibility)}>
                    <div className="flex items-start gap-3">
                      {result.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.species}</span>
                          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700 dark:text-yellow-300">
                            {result.reason}
                          </Badge>
                        </div>
                        <AlertDescription className="text-sm">
                          {result.details}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedSpecies && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <Fish className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">Choose a Species to Begin</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select any fish species from the dropdown above to see detailed compatibility analysis 
                with potential tankmates, including explanations for why they would or wouldn't work together.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Compatibility;