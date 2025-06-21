
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Fish, Droplets, Wrench, TestTube, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddLivestockForm } from "@/components/aquarium/AddLivestockForm";
import { QuickNoteForm } from "./QuickNoteForm";

type Aquarium = Pick<Tables<'aquariums'>, 'id' | 'name' | 'type' | 'size'>;

interface QuickAddTaskProps {
  aquariums: Aquarium[];
}

const quickActions = [
  { 
    id: 'water_change', 
    label: 'Water Change', 
    icon: <Droplets className="mr-2 h-4 w-4" />,
    color: 'text-blue-500'
  },
  { 
    id: 'water_test', 
    label: 'Water Test', 
    icon: <TestTube className="mr-2 h-4 w-4" />,
    color: 'text-green-500'
  },
  { 
    id: 'clean_filter', 
    label: 'Clean Filter', 
    icon: <Filter className="mr-2 h-4 w-4" />,
    color: 'text-purple-500'
  },
  { 
    id: 'maintenance', 
    label: 'General Maintenance', 
    icon: <Wrench className="mr-2 h-4 w-4" />,
    color: 'text-orange-500'
  },
];

export function QuickAddTask({ aquariums }: QuickAddTaskProps) {
  const [selectedAquariumId, setSelectedAquariumId] = useState<string>('');
  const [isQuickNoteDialogOpen, setQuickNoteDialogOpen] = useState(false);
  const [isLivestockDialogOpen, setLivestockDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [waterChangeValue, setWaterChangeValue] = useState<string>('');
  const [waterChangeUnit, setWaterChangeUnit] = useState<'percentage' | 'liters'>('percentage');
  
  const selectedAquarium = aquariums.find(aq => aq.id === selectedAquariumId);

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId);
    if (actionId === 'water_change') {
      // Reset water change inputs when opening
      setWaterChangeValue('');
      setWaterChangeUnit('percentage');
    }
    setQuickNoteDialogOpen(true);
  };

  const getActionTitle = () => {
    const action = quickActions.find(a => a.id === selectedAction);
    return action ? `Log ${action.label}` : 'Log Activity';
  };

  const getWaterChangeNotes = () => {
    if (selectedAction === 'water_change' && waterChangeValue) {
      const unit = waterChangeUnit === 'percentage' ? '%' : 'L';
      return `Water change: ${waterChangeValue}${unit}`;
    }
    return '';
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
          <CardDescription>Quickly log activities or add livestock to your aquariums.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedAquariumId} value={selectedAquariumId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an aquarium..." />
            </SelectTrigger>
            <SelectContent>
              {aquariums.map((aq) => (
                <SelectItem key={aq.id} value={aq.id}>{aq.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {quickActions.map((action) => (
                  <Button 
                      key={action.id}
                      variant="outline"
                      disabled={!selectedAquariumId}
                      onClick={() => handleActionClick(action.id)}
                      className="flex-col h-auto py-3"
                  >
                      <div className={action.color}>
                        {action.icon}
                      </div>
                      <span className="text-xs mt-1">{action.label}</span>
                  </Button>
              ))}
              <Button
                  variant="outline"
                  disabled={!selectedAquariumId}
                  onClick={() => setLivestockDialogOpen(true)}
                  className="flex-col h-auto py-3"
              >
                  <Fish className="mr-0 mb-1 h-4 w-4 text-green-500" />
                  <span className="text-xs">Add Livestock</span>
              </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isQuickNoteDialogOpen} onOpenChange={setQuickNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAction === 'water_change' && (
              <div className="space-y-3 p-3 border rounded-md bg-blue-50">
                <h4 className="font-medium text-sm">Water Change Details</h4>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={waterChangeValue}
                    onChange={(e) => setWaterChangeValue(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={waterChangeUnit} onValueChange={(value: 'percentage' | 'liters') => setWaterChangeUnit(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="liters">L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedAquarium?.size && waterChangeUnit === 'percentage' && waterChangeValue && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {((selectedAquarium.size * parseFloat(waterChangeValue)) / 100).toFixed(1)}L for this {selectedAquarium.size}L tank
                  </p>
                )}
              </div>
            )}
            {selectedAquarium && (
              <QuickNoteForm 
                aquariumId={selectedAquarium.id}
                actionType={selectedAction}
                initialNotes={getWaterChangeNotes()}
                onSuccess={() => {
                  setQuickNoteDialogOpen(false);
                  setSelectedAction('');
                  setWaterChangeValue('');
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLivestockDialogOpen} onOpenChange={setLivestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Livestock</DialogTitle>
          </DialogHeader>
          {selectedAquarium && (
            <AddLivestockForm
              aquariumId={selectedAquarium.id}
              aquariumType={selectedAquarium.type}
              onSuccess={() => setLivestockDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
