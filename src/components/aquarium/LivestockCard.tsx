
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
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{livestock.species}</h3>
            {livestock.name && (
              <p className="text-sm text-muted-foreground">"{livestock.name}"</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(livestock.id, livestock.quantity, -1)}>
              <Skull className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg min-w-[2rem] text-center">{livestock.quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(livestock.id, livestock.quantity, 1)}>
              <Plus className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8 ml-2">
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
