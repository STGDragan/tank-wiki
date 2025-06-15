
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function SlideshowSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const { data: images, isLoading } = useQuery({
    queryKey: ["slideshow_images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slideshow_images")
        .select("id, image_url, alt_text")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 bg-muted/50 dark:bg-muted/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">A glimpse into beautiful aquascapes</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Get inspired by these stunning aquariums from around the world.
            </p>
        </div>
        <Carousel 
          className="w-full max-w-5xl mx-auto" 
          opts={{ loop: true }}
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {isLoading && (
              <CarouselItem>
                <div className="overflow-hidden rounded-lg shadow-lg">
                  <Skeleton className="w-full aspect-[16/9]" />
                </div>
              </CarouselItem>
            )}
            {images?.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="overflow-hidden rounded-lg shadow-lg">
                  <img src={image.image_url} alt={image.alt_text || `Aquascape ${index + 1}`} className="w-full aspect-[16/9] object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
