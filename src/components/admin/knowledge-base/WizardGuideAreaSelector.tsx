
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWizardGuideAreas } from "@/hooks/useWizardGuideAreas";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Wand2 } from "lucide-react";

interface WizardGuideAreaSelectorProps {
  selectedAreas: string[];
  onChange: (selectedAreas: string[]) => void;
}

export function WizardGuideAreaSelector({ selectedAreas, onChange }: WizardGuideAreaSelectorProps) {
  const { data: guideAreas, isLoading } = useWizardGuideAreas();
  
  const handleAreaToggle = (areaId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedAreas, areaId]);
    } else {
      onChange(selectedAreas.filter(id => id !== areaId));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Wizard Guide Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!guideAreas?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Wizard Guide Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No wizard guide areas available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-600" />
          Wizard Guide Areas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select which wizard guide buttons should link to this article. Users will see these as guide links in the setup wizard.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {guideAreas.map((area) => (
            <div key={area.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id={area.id}
                checked={selectedAreas.includes(area.id)}
                onCheckedChange={(checked) => handleAreaToggle(area.id, checked as boolean)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <Label 
                    htmlFor={area.id} 
                    className="font-medium cursor-pointer text-sm"
                  >
                    {area.area_name}
                  </Label>
                </div>
                {area.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {area.description}
                  </p>
                )}
                <Badge variant="outline" className="text-xs mt-1">
                  {area.area_key}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {selectedAreas.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Selected Areas ({selectedAreas.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedAreas.map((areaId) => {
                const area = guideAreas.find(a => a.id === areaId);
                return area ? (
                  <Badge key={areaId} variant="secondary" className="text-xs">
                    {area.area_name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
