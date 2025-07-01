
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Fish, Droplets, Wrench, TestTube, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddLivestockForm } from "@/components/aquarium/AddLivestockForm";
import { QuickLogForm } from "./QuickLogForm";
import { VolumeUnitSelector } from "./VolumeUnitSelector";
import { useUserPreferences } from "@/hooks/useUserPreferences";

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
  const [isQuickLogDialogOpen, setQuickLogDialogOpen] = useState(false);
  const [isLivestockDialogOpen, setLivestockDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const { preferences } = useUserPreferences();
  
  const selectedAquarium = aquariums.find(aq => aq.id === selectedAquariumId);

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId);
    setQuickLogDialogOpen(true);
  };

  const getActionTitle = () => {
    const action = quickActions.find(a => a.id === selectedAction);
    return action ? `Log ${action.label}` : 'Log Activity';
  };
  
  return (
    <>
      <Card className="bg-gray-800 border-2 border-cyan-500/50 rounded-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-xl">Quick Add</CardTitle>
              <CardDescription className="text-gray-400">Quickly log activities or add livestock to your aquariums.</CardDescription>
            </div>
            <VolumeUnitSelector />
          </div>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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

      <Dialog open={isQuickLogDialogOpen} onOpenChange={setQuickLogDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
          </DialogHeader>
          {selectedAquarium && (
            <QuickLogForm 
              aquariumId={selectedAquarium.id}
              aquariumType={selectedAquarium.type}
              aquariumSize={selectedAquarium.size}
              actionType={selectedAction}
              onSuccess={() => {
                setQuickLogDialogOpen(false);
                setSelectedAction('');
              }}
            />
          )}
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
