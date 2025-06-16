
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Button } from '@/components/ui/button';
import { Plus, Skull, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Livestock = Tables<'livestock'>;

interface LivestockCardProps {
  livestock: Livestock;
  onUpdateQuantity: (livestockId: string, currentQuantity: number, change: number) => void;
  onDelete: (livestockId: string) => void;
}

export const LivestockCard = ({ livestock, onUpdateQuantity, onDelete }: LivestockCardProps) => {
  // Extract category from species if it starts with "Other"
  const getTypeAndSpecies = (species: string) => {
    if (species.startsWith('Other ')) {
      const type = species.replace('Other ', '');
      return { type, species: 'Other' };
    }
    
    // You could expand this logic to categorize known species
    // For now, we'll just show the species as both type and species
    return { type: 'General', species };
  };

  const { type, species } = getTypeAndSpecies(livestock.species);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Type</p>
            <p className="font-semibold">{type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Species</p>
            <p className="font-semibold">{species}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Name</p>
            <p className="text-sm">{livestock.name || 'No nickname'}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(livestock.id, livestock.quantity, -1)}>
                <Skull className="h-4 w-4" />
              </Button>
              <span className="font-bold text-lg min-w-[2rem] text-center">{livestock.quantity}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(livestock.id, livestock.quantity, 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove {livestock.species} from your aquarium. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(livestock.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
