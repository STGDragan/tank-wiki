
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  entry_date: string;
  image_url?: string;
  created_at: string;
}

interface TimelineSlideshowProps {
  aquariumId: string;
}

export function TimelineSlideshow({ aquariumId }: TimelineSlideshowProps) {
  const { data: timelineImages, isLoading } = useQuery({
    queryKey: ['timeline-images', aquariumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aquarium_timeline')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .not('image_url', 'is', null)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as TimelineEntry[];
    },
  });

  if (isLoading || !timelineImages || timelineImages.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {timelineImages.map((entry) => (
            <CarouselItem key={entry.id}>
              <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                <img
                  src={entry.image_url!}
                  alt={entry.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-white text-xl font-semibold mb-2">{entry.title}</h3>
                  <div className="flex items-center text-white/80 text-sm mb-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(entry.entry_date), "MMMM d, yyyy")}
                  </div>
                  {entry.description && (
                    <p className="text-white/90 text-sm line-clamp-2">{entry.description}</p>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
}
