
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlideshowSettings } from "@/hooks/useSlideshowSettings";
import { useSlideshowImages } from "@/hooks/useSlideshowImages";
import { SlideshowSectionProps } from "@/types/slideshow";

export function SlideshowSection({ context, autoplayDelay = 3000 }: SlideshowSectionProps) {
  const { data: settings } = useSlideshowSettings();
  const { data: images, isLoading, error } = useSlideshowImages(context);

  // Use settings delay if available, otherwise use prop
  const effectiveDelay = settings?.autoplay_delay || autoplayDelay;

  // Create a new plugin instance whenever the delay changes
  const plugin = React.useMemo(
    () => Autoplay({ delay: effectiveDelay, stopOnInteraction: false }),
    [effectiveDelay]
  );

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load slideshow.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden">
      <Carousel
        key={effectiveDelay} // Force re-render when delay changes
        className="w-full h-full"
        opts={{ loop: true }}
        plugins={[plugin]}
      >
        <CarouselContent className="h-full -ml-4">
          {isLoading && (
            <CarouselItem className="pl-4 basis-full">
              <div className="relative w-full h-full min-h-[400px]">
                <Skeleton className="w-full h-full" />
              </div>
            </CarouselItem>
          )}
          {images && images.length > 0 && images.map((image) => (
            <CarouselItem key={image.id} className="pl-4 basis-full">
              <div className="relative w-full h-full min-h-[400px] bg-gray-200">
                <img 
                  src={image.image_url} 
                  alt={image.alt_text || ""} 
                  className="absolute inset-0 w-full h-full object-cover"
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
