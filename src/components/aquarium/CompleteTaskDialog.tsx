import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, ClockIcon, SkipForward } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface CompleteTaskDialogProps {
  task: MaintenanceTask;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (taskId: string, completedDate: Date, additionalData?: any) => void;
  onSkip?: (taskId: string, skipDate: Date, newDueDate: Date, reason?: string) => void;
}

export function CompleteTaskDialog({ task, isOpen, onOpenChange, onComplete, onSkip }: CompleteTaskDialogProps) {
  const [completedDate, setCompletedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<'complete' | 'skip'>('complete');
  const [newDueDate, setNewDueDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 7)));
  
  // Water testing parameters
  const [temperature, setTemperature] = useState("");
  const [ph, setPh] = useState("");
  const [ammonia, setAmmonia] = useState("");
  const [nitrite, setNitrite] = useState("");
  const [nitrate, setNitrate] = useState("");
  
  // Water change parameters
  const [volumeChanged, setVolumeChanged] = useState("");
  
  // Filter maintenance
  const [filtersRemaining, setFiltersRemaining] = useState("");

  const isWaterTest = task.task.toLowerCase().includes('test water') || task.task.toLowerCase().includes('water parameters');
  const isWaterChange = task.task.toLowerCase().includes('water change');
  const isFilterReplace = task.task.toLowerCase().includes('replace filter');
  const isSimpleTask = !isWaterTest && !isWaterChange && !isFilterReplace;

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    const additionalData: any = {
      notes: notes || null
    };

    if (isWaterTest) {
      additionalData.waterParameters = {
        temperature: temperature ? parseFloat(temperature) : null,
        ph: ph ? parseFloat(ph) : null,
        ammonia: ammonia ? parseFloat(ammonia) : null,
        nitrite: nitrite ? parseFloat(nitrite) : null,
        nitrate: nitrate ? parseFloat(nitrate) : null,
      };
    }

    if (isWaterChange && volumeChanged) {
      additionalData.volumeChanged = parseFloat(volumeChanged);
    }

    if (isFilterReplace && filtersRemaining) {
      additionalData.filtersRemaining = parseInt(filtersRemaining);
    }

    await onComplete(task.id, completedDate, additionalData);
    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setNotes("");
    setTemperature("");
    setPh("");
    setAmmonia("");
    setNitrite("");
    setNitrate("");
    setVolumeChanged("");
    setFiltersRemaining("");
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    
    if (onSkip) {
      await onSkip(task.id, completedDate, newDueDate, notes);
    }
    
    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setNotes("");
    setMode('complete');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'complete' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Complete Task
              </>
            ) : (
              <>
                <SkipForward className="h-5 w-5 text-amber-600" />
                Skip Task
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'complete' 
              ? `Mark "${task.task}" as completed and provide additional details.`
              : `Reschedule "${task.task}" for later.`}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'complete' | 'skip')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="complete" className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Complete
            </TabsTrigger>
            <TabsTrigger value="skip" className="flex items-center gap-1">
              <SkipForward className="h-4 w-4" />
              Skip
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="complete" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Completion Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !completedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {completedDate ? format(completedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={completedDate}
                    onSelect={(date) => date && setCompletedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {isWaterTest && (
              <div className="space-y-3 rounded-lg border p-3 bg-muted/50">
                <Label className="text-sm font-semibold">Water Test Results</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="temp" className="text-xs">Temperature (°F)</Label>
                    <Input
                      id="temp"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ph" className="text-xs">pH</Label>
                    <Input
                      id="ph"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={ph}
                      onChange={(e) => setPh(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ammonia" className="text-xs">Ammonia (ppm)</Label>
                    <Input
                      id="ammonia"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={ammonia}
                      onChange={(e) => setAmmonia(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nitrite" className="text-xs">Nitrite (ppm)</Label>
                    <Input
                      id="nitrite"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={nitrite}
                      onChange={(e) => setNitrite(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="nitrate" className="text-xs">Nitrate (ppm)</Label>
                    <Input
                      id="nitrate"
                      type="number"
                      step="1"
                      placeholder="0"
                      value={nitrate}
                      onChange={(e) => setNitrate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {isWaterChange && (
              <div className="space-y-2 rounded-lg border p-3 bg-muted/50">
                <Label htmlFor="volume" className="text-sm font-semibold">Water Change Details</Label>
                <div>
                  <Label htmlFor="volume" className="text-xs">Volume Changed (gallons)</Label>
                  <Input
                    id="volume"
                    type="number"
                    step="0.1"
                    placeholder="Enter gallons changed"
                    value={volumeChanged}
                    onChange={(e) => setVolumeChanged(e.target.value)}
                  />
                </div>
              </div>
            )}

            {isFilterReplace && (
              <div className="space-y-2 rounded-lg border p-3 bg-muted/50">
                <Label className="text-sm font-semibold">Filter Replacement</Label>
                <div>
                  <Label htmlFor="filters" className="text-xs">Filters Remaining (optional)</Label>
                  <Input
                    id="filters"
                    type="number"
                    placeholder="How many filters do you have left?"
                    value={filtersRemaining}
                    onChange={(e) => setFiltersRemaining(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about completing this task..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? "Completing..." : "Complete Task"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="skip" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Skip Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !completedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {completedDate ? format(completedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={completedDate}
                    onSelect={(date) => date && setCompletedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>New Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newDueDate && "text-muted-foreground"
                    )}
                  >
                    <ClockIcon className="mr-2 h-4 w-4" />
                    {newDueDate ? format(newDueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newDueDate}
                    onSelect={(date) => date && setNewDueDate(date)}
                    initialFocus
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skip-reason">Reason for Skipping (Optional)</Label>
              <Textarea
                id="skip-reason"
                placeholder="Why are you skipping this task?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSkip} 
                disabled={isSubmitting}
                variant="secondary" 
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? "Skipping..." : "Skip & Reschedule"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}