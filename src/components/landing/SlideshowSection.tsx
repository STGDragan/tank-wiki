
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SlideshowSectionProps {
  context: string;
  autoplayDelay?: number; // in milliseconds, defaults to 3000
}

export function SlideshowSection({ context, autoplayDelay = 3000 }: SlideshowSectionProps) {
  const [carouselApi, setCarouselApi] = React.useState<any>(null);
  
  // Query for slideshow settings
  const { data: settings } = useQuery({
    queryKey: ["slideshow_settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("slideshow_settings")
        .select("*")
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Use settings delay if available, otherwise use prop
  const effectiveDelay = settings?.autoplay_delay || autoplayDelay;

  const plugin = React.useRef(
    Autoplay({ delay: effectiveDelay, stopOnInteraction: false })
  );

  // Update the plugin and restart carousel when delay changes
  React.useEffect(() => {
    if (carouselApi && plugin.current) {
      console.log("Updating slideshow delay to:", effectiveDelay);
      // Stop current autoplay
      plugin.current.stop();
      // Create new plugin with updated delay
      plugin.current = Autoplay({ delay: effectiveDelay, stopOnInteraction: false });
      // Restart with new settings
      plugin.current.init(carouselApi);
      plugin.current.play();
    }
  }, [effectiveDelay, carouselApi]);

  const { data: images, isLoading, error } = useQuery({
    queryKey: ["slideshow_images", context],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("slideshow_images")
        .select("id, image_url, alt_text")
        .eq("context", context)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  console.log("Slideshow images data:", images);
  console.log("Slideshow loading state:", isLoading);
  console.log("Slideshow error:", error);
  console.log("Effective delay:", effectiveDelay);

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden">
      <Carousel
        className="w-full h-full"
        opts={{ loop: true }}
        plugins={[plugin.current]}
        setApi={setCarouselApi}
      >
        <CarouselContent className="h-full -ml-4">
          {isLoading && (
            <CarouselItem className="pl-4 basis-full">
              <div className="relative w-full h-full min-h-[400px]">
                <Skeleton className="w-full h-full" />
              </div>
            </CarouselItem>
          )}
          {images && images.length > 0 && images.map((image: any) => (
            <CarouselItem key={image.id} className="pl-4 basis-full">
              <div className="relative w-full h-full min-h-[400px] bg-gray-200">
                <img 
                  src={image.image_url} 
                  alt={image.alt_text || ""} 
                  className="absolute inset-0 w-full h-full object-cover"
                  onLoad={() => {
                    console.log(`Image loaded: ${image.image_url}`);
                  }}
                  onError={(e) => console.error(`Image failed to load: ${image.image_url}`, e)}
                />
              </div>
            </CarouselItem>
          ))}
          {!isLoading && (!images || images.length === 0) && (
            <CarouselItem className="pl-4 basis-full">
              <div className="w-full h-full min-h-[400px] bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No slideshow images available.</p>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
