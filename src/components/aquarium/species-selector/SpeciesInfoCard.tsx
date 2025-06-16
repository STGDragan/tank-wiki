
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, AlertTriangle, Fish } from 'lucide-react';
import { getDetailedFishInfo, DetailedFishInfo } from '@/data/species/detailedFishData';

interface SpeciesInfoCardProps {
  speciesName: string;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced': return 'bg-orange-100 text-orange-800';
    case 'Expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function SpeciesInfoCard({ speciesName }: SpeciesInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailedInfo = getDetailedFishInfo(speciesName);

  if (!detailedInfo) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Fish className="mr-2 h-5 w-5" />
            {speciesName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Basic species information available. Detailed care requirements coming soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Fish className="mr-2 h-5 w-5" />
              {detailedInfo.species_name.split('(')[0].trim()}
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className={getDifficultyColor(detailedInfo.difficulty)}>
              {detailedInfo.difficulty}
            </Badge>
            <Badge variant="outline">
              {detailedInfo.family_name}
            </Badge>
            <Badge variant="secondary">
              Min {detailedInfo.min_tank_size}gal
            </Badge>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              {/* Scientific Name */}
              <div>
                <h4 className="font-semibold text-sm mb-1">Scientific Name</h4>
                <p className="text-sm text-muted-foreground italic">
                  {detailedInfo.species_name.match(/\((.*?)\)/)?.[1] || 'Not available'}
                </p>
              </div>

              {/* Tank Requirements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Tank Size</h4>
                  <p className="text-sm">{detailedInfo.min_tank_size}+ gallons</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Max Size</h4>
                  <p className="text-sm">{detailedInfo.max_size} inches</p>
                </div>
              </div>

              {/* Compatibility */}
              <div>
                <h4 className="font-semibold text-sm mb-1 flex items-center">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Compatibility Notes
                </h4>
                <p className="text-sm text-muted-foreground">
                  {detailedInfo.compatibility_notes}
                </p>
              </div>

              {/* Tank Mate Issues */}
              {detailedInfo.tank_mate_issues && (
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-orange-600">
                    Tank Mate Considerations
                  </h4>
                  <p className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                    {detailedInfo.tank_mate_issues}
                  </p>
                </div>
              )}

              {/* Tags */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Characteristics</h4>
                <div className="flex flex-wrap gap-1">
                  {detailedInfo.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tank Type */}
              <div>
                <h4 className="font-semibold text-sm mb-1">Recommended Tank Type</h4>
                <p className="text-sm text-muted-foreground">
                  {detailedInfo.tank_type}
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
