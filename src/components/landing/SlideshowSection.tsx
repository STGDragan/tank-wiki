
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const images = [
  "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=1912&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611851911433-455b7a584323?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599544990888-d053240887e4?q=80&w=2070&auto=format&fit=crop"
];

export function SlideshowSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

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
            {images.map((src, index) => (
              <CarouselItem key={index}>
                <div className="overflow-hidden rounded-lg shadow-lg">
                  <img src={src} alt={`Aquascape ${index + 1}`} className="w-full aspect-[16/9] object-cover" />
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
