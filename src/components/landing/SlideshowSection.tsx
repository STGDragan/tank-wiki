
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

  // Define optimal dimensions based on context
  const getOptimalDimensions = () => {
    switch (context) {
      case 'dashboard':
        return { width: 1200, height: 200, aspectRatio: '6:1' }; // Dashboard banner
      case 'landing-page':
        return { width: 1200, height: 400, aspectRatio: '3:1' }; // Landing page hero
      default:
        return { width: 1200, height: 400, aspectRatio: '3:1' };
    }
  };

  const dimensions = getOptimalDimensions();

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load slideshow.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden bg-gray-100">
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
              <div className="relative w-full h-full min-h-[400px] bg-gray-200 overflow-hidden">
                <img 
                  src={image.image_url} 
                  alt={image.alt_text || ""} 
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    objectPosition: 'center center',
                    minHeight: '400px'
                  }}
                />
              </div>
            </CarouselItem>
          ))}
          {!isLoading && (!images || images.length === 0) && (
            <CarouselItem className="pl-4 basis-full">
              <div className="w-full h-full min-h-[400px] bg-muted flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-2">No slideshow images available.</p>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  For best results, upload images with dimensions: {dimensions.width} × {dimensions.height}px 
                  (aspect ratio {dimensions.aspectRatio})
                </p>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
