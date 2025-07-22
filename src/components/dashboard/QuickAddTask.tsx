import React, { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Fish, Droplets, Wrench, TestTube, Filter, Plus, AlertCircle, Database } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddLivestockForm } from "@/components/aquarium/AddLivestockForm";
import { EnhancedAddEquipmentForm } from "@/components/aquarium/EnhancedAddEquipmentForm";
import { QuickLogForm } from "./QuickLogForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Aquarium = Pick<Tables<'aquariums'>, 'id' | 'name' | 'type' | 'size'>;

interface QuickAddTaskProps {
  aquariums: Aquarium[];
}

const quickActions = [
  { 
    id: 'water_change', 
    label: 'Water Change', 
    icon: <Droplets className="h-5 w-5" />,
    color: 'text-blue-400 hover:text-blue-300',
    bgColor: 'bg-blue-900/20 hover:bg-blue-800/30 border-blue-500/30 hover:border-blue-400/50'
  },
  { 
    id: 'water_test', 
    label: 'Water Test', 
    icon: <TestTube className="h-5 w-5" />,
    color: 'text-green-400 hover:text-green-300',
    bgColor: 'bg-green-900/20 hover:bg-green-800/30 border-green-500/30 hover:border-green-400/50'
  },
  { 
    id: 'clean_filter', 
    label: 'Clean Filter', 
    icon: <Filter className="h-5 w-5" />,
    color: 'text-purple-400 hover:text-purple-300',
    bgColor: 'bg-purple-900/20 hover:bg-purple-800/30 border-purple-500/30 hover:border-purple-400/50'
  },
  { 
    id: 'maintenance', 
    label: 'General Maintenance', 
    icon: <Wrench className="h-5 w-5" />,
    color: 'text-orange-400 hover:text-orange-300',
    bgColor: 'bg-orange-900/20 hover:bg-orange-800/30 border-orange-500/30 hover:border-orange-400/50'
  },
];

export function QuickAddTask({ aquariums }: QuickAddTaskProps) {
  // Default to oldest aquarium (first in array)
  const [selectedAquariumId, setSelectedAquariumId] = useState<string>(() => 
    aquariums.length > 0 ? aquariums[0].id : ''
  );
  const [isQuickLogDialogOpen, setQuickLogDialogOpen] = useState(false);
  const [isLivestockDialogOpen, setLivestockDialogOpen] = useState(false);
  const [isEquipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  
  // Update selected aquarium when aquariums change
  React.useEffect(() => {
    if (aquariums.length > 0 && !selectedAquariumId) {
      setSelectedAquariumId(aquariums[0].id);
    }
  }, [aquariums, selectedAquariumId]);
  
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
      <Card className="cyber-card glass-panel">
        <CardHeader>
          <div>
            <CardTitle className="text-primary font-display">Quick Add</CardTitle>
            <CardDescription className="text-muted-foreground font-mono">
              Select an aquarium and quickly log activities or add items.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prominent Aquarium Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h4 className="text-lg font-display text-primary">Select Your Aquarium</h4>
            </div>
            <Select onValueChange={setSelectedAquariumId} value={selectedAquariumId}>
              <SelectTrigger className={`cyber-input h-12 text-base ${!selectedAquariumId ? 'border-amber-500/50 bg-amber-950/20' : 'border-green-500/50 bg-green-950/20'}`}>
                <SelectValue placeholder="🐠 Choose which aquarium to work with..." />
              </SelectTrigger>
              <SelectContent>
                {aquariums.map((aq) => (
                  <SelectItem key={aq.id} value={aq.id} className="text-base py-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>{aq.name}</span>
                      {aq.type && <span className="text-xs text-muted-foreground">({aq.type})</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {!selectedAquariumId && (
              <Alert className="border-amber-500/50 bg-amber-950/20">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-200">
                  Please select an aquarium above to enable quick actions below.
                </AlertDescription>
              </Alert>
            )}
            
            {selectedAquarium && (
              <div className="p-3 rounded-lg bg-green-950/20 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Working with: {selectedAquarium.name}</span>
                  {selectedAquarium.type && (
                    <span className="text-xs bg-green-900/50 px-2 py-1 rounded">
                      {selectedAquarium.type}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Log Activities Section */}
          <div className={`transition-all duration-300 ${!selectedAquariumId ? 'opacity-50' : 'opacity-100'}`}>
            <h4 className="text-sm font-display text-primary mb-3 flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Log Activities
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button 
                  key={action.id}
                  variant="outline"
                  disabled={!selectedAquariumId}
                  onClick={() => handleActionClick(action.id)}
                  className={`flex-col h-20 p-3 border-2 transition-all duration-200 ${action.bgColor} ${action.color} ${!selectedAquariumId ? 'cursor-not-allowed' : ''}`}
                >
                  {action.icon}
                  <span className="text-xs mt-2 font-mono">{action.label}</span>
                </Button>
              ))}
            </div>
            {!selectedAquariumId && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Select an aquarium above to enable activity logging
              </p>
            )}
          </div>

          {/* Add Items Section */}
          <div className={`transition-all duration-300 ${!selectedAquariumId ? 'opacity-50' : 'opacity-100'}`}>
            <h4 className="text-sm font-display text-primary mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Items
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                disabled={!selectedAquariumId}
                onClick={() => setLivestockDialogOpen(true)}
                className={`flex-col h-20 p-3 border-2 transition-all duration-200 bg-cyan-900/20 hover:bg-cyan-800/30 border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400 hover:text-cyan-300 ${!selectedAquariumId ? 'cursor-not-allowed' : ''}`}
              >
                <Fish className="h-5 w-5" />
                <span className="text-xs mt-2 font-mono">Add Livestock</span>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedAquariumId}
                onClick={() => setEquipmentDialogOpen(true)}
                className={`flex-col h-20 p-3 border-2 transition-all duration-200 bg-teal-900/20 hover:bg-teal-800/30 border-teal-500/30 hover:border-teal-400/50 text-teal-400 hover:text-teal-300 ${!selectedAquariumId ? 'cursor-not-allowed' : ''}`}
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs mt-2 font-mono">Add Equipment</span>
              </Button>
            </div>
            {!selectedAquariumId && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Select an aquarium above to add livestock or equipment
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isQuickLogDialogOpen} onOpenChange={setQuickLogDialogOpen}>
        <DialogContent className="cyber-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">{getActionTitle()}</DialogTitle>
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
        <DialogContent className="cyber-card">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Add Livestock</DialogTitle>
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

      <Dialog open={isEquipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
        <DialogContent className="cyber-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Add Equipment</DialogTitle>
          </DialogHeader>
          {selectedAquarium && (
            <EnhancedAddEquipmentForm
              aquariumId={selectedAquarium.id}
              aquariumType={selectedAquarium.type}
              onSuccess={() => setEquipmentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}