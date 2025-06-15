
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TankCardProps {
  id: string;
  name: string;
  type: string;
  size: number;
  image_url: string | null;
  onDelete: (id: string) => void;
}

export function TankCard({ id, name, type, size, image_url, onDelete }: TankCardProps) {
  const imageUrl = image_url || `https://placehold.co/600x400/34D399/FFFFFF?text=${encodeURIComponent(name)}`;
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <Link to={`/aquarium/${id}`}>
          <img src={imageUrl} alt={name} className="rounded-t-lg aspect-video object-cover w-full" />
        </Link>
      </CardHeader>
      <div className="p-6 flex-grow flex flex-col">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{type}</CardDescription>
        <CardContent className="p-0 pt-2 flex-grow">
          <p className="text-sm text-muted-foreground">{size} Gallons</p>
        </CardContent>
        <CardFooter className="p-0 pt-4 mt-auto flex gap-2">
          <Button variant="outline" asChild className="flex-grow">
            <Link to={`/aquarium/${id}`}>
              View Details <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your aquarium and all of its associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(id)}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </CardFooter>
      </div>
    </Card>
  );
}
