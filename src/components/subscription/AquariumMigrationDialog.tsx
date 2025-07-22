import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown, ExternalLink } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/providers/AuthProvider';

type Aquarium = Tables<'aquariums'>;

interface AquariumMigrationDialogProps {
  isOpen: boolean;
  aquariums: Aquarium[];
  onComplete: (selectedIds: string[]) => void;
  isLoading?: boolean;
  maxSelection?: number;
}

export function AquariumMigrationDialog({ 
  isOpen, 
  aquariums, 
  onComplete, 
  isLoading = false,
  maxSelection = 3 
}: AquariumMigrationDialogProps) {
  const [selectedAquariumIds, setSelectedAquariumIds] = useState<string[]>(() => 
    // Pre-select the oldest aquariums by default
    aquariums.slice(0, maxSelection).map(aq => aq.id)
  );
  const { hasActiveSubscription } = useAuth();

  const handleAquariumToggle = (aquariumId: string, checked: boolean) => {
    if (checked && selectedAquariumIds.length >= maxSelection) {
      return; // Don't allow more than max selection
    }
    
    if (checked) {
      setSelectedAquariumIds(prev => [...prev, aquariumId]);
    } else {
      setSelectedAquariumIds(prev => prev.filter(id => id !== aquariumId));
    }
  };

  const handleComplete = () => {
    if (selectedAquariumIds.length === 0) {
      return; // Must select at least one
    }
    onComplete(selectedAquariumIds);
  };

  const handleResubscribe = () => {
    // Open Stripe checkout or subscription page
    window.open('/pro', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">{/* Cannot be closed */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Subscription Expired - Aquarium Selection Required
          </DialogTitle>
          <DialogDescription className="text-left">
            Your Pro subscription has expired. You can now only maintain <strong>{maxSelection} aquariums</strong> on the free plan. 
            Please select which aquariums you'd like to keep. The others will be archived but can be restored when you resubscribe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resubscribe Option */}
          <Card className="border-amber-500/50 bg-amber-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-amber-200">Keep All Your Aquariums</CardTitle>
              </div>
              <CardDescription className="text-amber-300/80">
                Resubscribe to Pro and keep all {aquariums.length} aquariums without any limitations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleResubscribe}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                Resubscribe to Pro
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Aquarium Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Aquariums to Keep ({selectedAquariumIds.length}/{maxSelection})</CardTitle>
              <CardDescription>
                Choose which aquariums you want to continue managing on the free plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {aquariums.map((aquarium) => {
                  const isSelected = selectedAquariumIds.includes(aquarium.id);
                  const canSelect = isSelected || selectedAquariumIds.length < maxSelection;
                  
                  return (
                    <div 
                      key={aquarium.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        isSelected 
                          ? 'border-green-500/50 bg-green-950/20' 
                          : canSelect 
                          ? 'border-border bg-background hover:bg-muted/50' 
                          : 'border-muted bg-muted/20 opacity-60'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={!canSelect}
                        onCheckedChange={(checked) => 
                          handleAquariumToggle(aquarium.id, checked as boolean)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{aquarium.name}</h4>
                          {isSelected && (
                            <Badge variant="default" className="bg-green-600">
                              Selected
                            </Badge>
                          )}
                          {aquarium.type && (
                            <Badge variant="outline" className="text-xs">
                              {aquarium.type}
                            </Badge>
                          )}
                        </div>
                        {aquarium.size && (
                          <p className="text-sm text-muted-foreground">
                            {aquarium.size} gallons
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedAquariumIds.length === 0 && (
                <p className="text-sm text-destructive mt-2">
                  You must select at least one aquarium to continue.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleResubscribe}
            className="border-amber-500 text-amber-500 hover:bg-amber-950/20"
          >
            <Crown className="mr-2 h-4 w-4" />
            Resubscribe Instead
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={selectedAquariumIds.length === 0 || isLoading}
            variant="destructive"
          >
            {isLoading ? 'Processing...' : `Continue with ${selectedAquariumIds.length} Aquarium${selectedAquariumIds.length === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}