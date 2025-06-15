
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Fish } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddMaintenanceTaskForm } from "@/components/aquarium/AddMaintenanceTaskForm";
import { AddLivestockForm } from "@/components/aquarium/AddLivestockForm";

type Aquarium = Pick<Tables<'aquariums'>, 'id' | 'name' | 'type'>;

interface QuickAddTaskProps {
  aquariums: Aquarium[];
}

const commonTasks = ['Water Change', 'Water Test', 'Clean Filter'];

export function QuickAddTask({ aquariums }: QuickAddTaskProps) {
  const [selectedAquariumId, setSelectedAquariumId] = useState<string>('');
  const [isTaskDialogOpen, setTaskDialogOpen] = useState(false);
  const [isLivestockDialogOpen, setLivestockDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  
  const selectedAquarium = aquariums.find(aq => aq.id === selectedAquariumId);

  const handleTaskClick = (task: string) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
          <CardDescription>Quickly add a common maintenance task or new livestock to one of your aquariums.</CardDescription>
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
              {commonTasks.map((task) => (
                  <Button 
                      key={task}
                      variant="outline"
                      disabled={!selectedAquariumId}
                      onClick={() => handleTaskClick(task)}
                  >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {task}
                  </Button>
              ))}
              <Button
                  variant="outline"
                  disabled={!selectedAquariumId}
                  onClick={() => setLivestockDialogOpen(true)}
              >
                  <Fish className="mr-2 h-4 w-4" />
                  Add Livestock
              </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isTaskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Maintenance Task</DialogTitle>
          </DialogHeader>
          {selectedAquarium && (
            <AddMaintenanceTaskForm 
              aquariumId={selectedAquarium.id}
              aquariumType={selectedAquarium.type}
              initialTask={selectedTask}
              onSuccess={() => {
                setTaskDialogOpen(false);
                setSelectedTask('');
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
