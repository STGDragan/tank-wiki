
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SlideshowImageCardProps {
  image: any; // HACK: Using any to bypass stale Supabase types
}

export function SlideshowImageCard({ image }: SlideshowImageCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (imageToDelete: any) => {
      const { error: dbError } = await (supabase as any).from("slideshow_images").delete().eq("id", imageToDelete.id);
      if (dbError) throw dbError;

      const storageUrlPart = `/storage/v1/object/public/slideshow_images/`;
      if (imageToDelete.image_url.includes(storageUrlPart)) {
        const filePath = imageToDelete.image_url.split(storageUrlPart)[1];
        const { error: storageError } = await (supabase as any)
          .storage
          .from('slideshow_images')
          .remove([filePath]);
        
        if (storageError) {
          console.error("Failed to delete from storage, but DB entry was removed:", storageError);
          toast.warning(`Image deleted from slideshow, but failed to remove file from storage: ${storageError.message}`);
        }
      }
    },
    onSuccess: () => {
      toast.success("Image deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["slideshow_images_admin"] });
      queryClient.invalidateQueries({ queryKey: ["slideshow_images"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete image: ${error.message}`);
    },
  });

  return (
    <Card className="overflow-hidden">
      <img
        src={image.image_url}
        alt={image.alt_text || ""}
        className="w-full h-40 object-cover"
      />
      <CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium truncate">{image.alt_text}</p>
        <p className="text-xs text-muted-foreground">Context: <span className="font-mono bg-muted px-1 py-0.5 rounded">{image.context}</span></p>
        <p className="text-xs text-muted-foreground truncate">{image.image_url}</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                image from the slideshow and storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(image)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
