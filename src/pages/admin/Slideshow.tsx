
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddSlideshowImageForm } from "@/components/admin/slideshow/AddSlideshowImageForm";
import { SlideshowImageCard } from "@/components/admin/slideshow/SlideshowImageCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function AdminSlideshow() {
  const { data: images, isLoading, error } = useQuery({
    queryKey: ["slideshow_images_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slideshow_images")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Slideshow Settings</h1>
        <p className="text-muted-foreground">
          Manage the images that appear on the landing page slideshow.
        </p>
      </div>

      <AddSlideshowImageForm />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Images</h2>
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error fetching images</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images?.map((image) => (
            <SlideshowImageCard key={image.id} image={image} />
          ))}
        </div>
        {images?.length === 0 && <p className="text-muted-foreground">No images found.</p>}
      </div>
    </div>
  );
}
