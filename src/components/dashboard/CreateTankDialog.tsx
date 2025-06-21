
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/hooks/use-toast";

interface CreateTankDialogProps {
  aquariumCount: number;
  trigger?: React.ReactNode;
}

export function CreateTankDialog({ aquariumCount, trigger }: CreateTankDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const { user, hasActiveSubscription } = useAuth();
  const queryClient = useQueryClient();

  const createAquariumMutation = useMutation({
    mutationFn: async (aquariumData: any) => {
      const { data, error } = await supabase.from('aquariums').insert([aquariumData]).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      toast({ title: 'Aquarium created successfully!' });
      setOpen(false);
      setName("");
      setType("");
      setSize("");
      setDescription("");
    },
    onError: (err: Error) => {
      toast({ title: 'Error creating aquarium', description: err.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasActiveSubscription && aquariumCount >= 2) {
      toast({
        title: "Upgrade Required",
        description: "Free users can create up to 2 aquariums. Upgrade to Pro for unlimited aquariums.",
        variant: "destructive"
      });
      return;
    }

    if (!name.trim()) {
      toast({ title: 'Please enter a name for your aquarium', variant: 'destructive' });
      return;
    }

    createAquariumMutation.mutate({
      name: name.trim(),
      type: type || null,
      size: size ? parseFloat(size) : null,
      description: description.trim() || null,
      user_id: user?.id
    });
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Tank
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Aquarium</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Aquarium"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select aquarium type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freshwater">Freshwater</SelectItem>
                <SelectItem value="saltwater">Saltwater</SelectItem>
                <SelectItem value="reef">Reef</SelectItem>
                <SelectItem value="brackish">Brackish</SelectItem>
                <SelectItem value="planted">Planted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size">Size (gallons)</Label>
            <Input
              id="size"
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g., 20"
              min="1"
              step="0.1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your aquarium..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createAquariumMutation.isPending}
              className="flex-1"
            >
              {createAquariumMutation.isPending ? 'Creating...' : 'Create Aquarium'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
