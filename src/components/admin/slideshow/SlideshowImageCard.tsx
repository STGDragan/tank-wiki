
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
import { Tables } from "@/integrations/supabase/types";

interface SlideshowImageCardProps {
  image: Tables<"slideshow_images">;
}

export function SlideshowImageCard({ image }: SlideshowImageCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("slideshow_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["slideshow_images_admin"] });
      queryClient.invalidateQueries({ queryKey: ["slideshow_images"] });
    },
    onError: (error) => {
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
                image from the slideshow.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(image.id)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
