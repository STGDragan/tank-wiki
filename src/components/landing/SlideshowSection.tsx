
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSlideshowImages } from "@/hooks/useSlideshowImages";
import { useSlideshowSettings } from "@/hooks/useSlideshowSettings";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

interface SlideshowSectionProps {
  context: string;
  autoplayDelay?: number;
}

export const SlideshowSection = ({ context, autoplayDelay }: SlideshowSectionProps) => {
  const { data: images, isLoading: imagesLoading } = useSlideshowImages(context);
  const { data: settings } = useSlideshowSettings();
  
  const effectiveDelay = autoplayDelay || settings?.autoplay_delay || 3000;
  
  const plugin = Autoplay({ delay: effectiveDelay });

  if (imagesLoading) {
    return (
      <div className="w-full h-full slideshow-container bg-transparent">
        <Skeleton className="w-full h-full bg-muted/20" />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full slideshow-container bg-transparent flex items-center justify-center">
        <p className="text-muted-foreground font-mono">No images available for slideshow</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full slideshow-container bg-transparent overflow-hidden">
      <Carousel
        plugins={[plugin]}
        className="w-full h-full bg-transparent"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="h-full bg-transparent">
          {images.map((image, index) => (
            <CarouselItem key={image.id} className="h-full bg-transparent">
              <div className="w-full h-full bg-transparent">
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Slideshow image ${index + 1}`}
                  className="w-full h-full object-cover bg-transparent"
                  style={{ background: 'transparent' }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
