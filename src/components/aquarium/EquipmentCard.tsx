
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Equipment = Tables<'equipment'> & { image_url?: string | null };

interface EquipmentCardProps {
  equipment: Equipment;
  onDelete: (id: string) => void;
}

export const EquipmentCard = ({ equipment, onDelete }: EquipmentCardProps) => {
  const imageUrl = equipment.image_url || `https://placehold.co/400x300/10B981/FFFFFF?text=${equipment.type.replace(/\s/g, '+')}`;
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{equipment.type}</CardTitle>
        <CardDescription>{equipment.brand} {equipment.model}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <img src={imageUrl} alt={equipment.type} className="rounded-md mb-4 aspect-video object-cover" />
        {equipment.installed_at && <p className="text-sm text-muted-foreground">Installed on {format(new Date(equipment.installed_at), 'PPP')}</p>}
      </CardContent>
       <CardFooter className="pt-4 flex justify-end">
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this piece of equipment.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(equipment.id)}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
