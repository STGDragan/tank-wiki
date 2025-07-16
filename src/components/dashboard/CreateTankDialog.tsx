
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { ProUpgradePrompt } from "@/components/wizard/ProUpgradePrompt";
import { AquariumSetupWizard } from "@/components/wizard/AquariumSetupWizard";
import { tankTypes } from "@/data/tankTypes";

interface CreateTankDialogProps {
  aquariumCount: number;
  trigger?: React.ReactNode;
}

export function CreateTankDialog({ aquariumCount, trigger }: CreateTankDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProPrompt, setShowProPrompt] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, hasActiveSubscription } = useAuth();
  const queryClient = useQueryClient();

  const handleCreateClick = () => {
    // Check if user has reached the limit (3 tanks for free users)
    if (!hasActiveSubscription && aquariumCount >= 3) {
      setShowProPrompt(true);
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !type) return;

    // Additional check to prevent bypass
    if (!hasActiveSubscription && aquariumCount >= 3) {
      setIsOpen(false);
      setShowProPrompt(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('aquariums')
        .insert({
          name,
          type,
          size: size ? parseInt(size) : null,
          user_id: user.id
        });

      if (error) throw error;

      toast({ title: "Aquarium created successfully!" });
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      setIsOpen(false);
      setName("");
      setType("");
      setSize("");
    } catch (error: any) {
      toast({ 
        title: "Error creating aquarium", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowDialog = hasActiveSubscription || aquariumCount < 3;
  
  const defaultTrigger = (
    <Button 
      size="lg" 
      className="btn-vibrant shadow-lg hover:shadow-xl font-semibold"
      onClick={handleCreateClick}
    >
      <PlusCircle className="h-5 w-5 mr-2" />
      Add Aquarium
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {shouldShowDialog && (
          <DialogTrigger asChild>
            {trigger ? (
              <div onClick={handleCreateClick}>
                {trigger}
              </div>
            ) : (
              defaultTrigger
            )}
          </DialogTrigger>
        )}
        
        {!shouldShowDialog && (
          trigger ? (
            <div onClick={handleCreateClick}>
              {trigger}
            </div>
          ) : (
            defaultTrigger
          )
        )}
        <DialogContent className="vibrant-card max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Aquarium</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Aquarium Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Living Room Tank"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tank Type *</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select tank type" />
                </SelectTrigger>
                <SelectContent>
                  {tankTypes.map((tankType) => (
                    <SelectItem key={tankType.value} value={tankType.value}>
                      <div className="flex items-center gap-2">
                        <span>{tankType.emoji}</span>
                        <span>{tankType.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="size">Size (gallons)</Label>
              <Input
                id="size"
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g., 40"
                min="1"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="btn-vibrant flex-1">
                {isSubmitting ? "Creating..." : "Create Aquarium"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Want a guided setup experience?
            </p>
            <div className="flex justify-center">
              <AquariumSetupWizard aquariumCount={aquariumCount} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProUpgradePrompt 
        isOpen={showProPrompt} 
        onClose={() => setShowProPrompt(false)}
        aquariumCount={aquariumCount}
      />
    </>
  );
}
