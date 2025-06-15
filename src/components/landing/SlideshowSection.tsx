
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
}

export function SlideshowSection({ context }: SlideshowSectionProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const { data: images, isLoading } = useQuery({
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

  return (
    <Carousel
      className="w-full h-full"
      opts={{ loop: true }}
      plugins={[plugin.current]}
    >
      <CarouselContent className="h-full ml-0">
        {isLoading && (
          <CarouselItem className="pl-0 h-full">
            <Skeleton className="w-full h-full" />
          </CarouselItem>
        )}
        {images?.map((image: any) => (
          <CarouselItem key={image.id} className="pl-0 h-full">
            <img 
              src={image.image_url} 
              alt={image.alt_text || ""} 
              className="w-full h-full object-cover" 
            />
          </CarouselItem>
        ))}
        {!isLoading && (!images || images.length === 0) && (
            <CarouselItem className="pl-0 h-full">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No slideshow images available.</p>
                </div>
            </CarouselItem>
        )}
      </CarouselContent>
    </Carousel>
  );
}
