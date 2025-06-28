
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface Sponsorship {
  id: string;
  title: string;
  description: string;
  sponsor_url: string;
  image_url?: string;
  is_active: boolean;
  priority: number;
}

interface SponsorshipBannerProps {
  page: string;
  maxDisplay?: number;
  autoScroll?: boolean;
  scrollInterval?: number;
}

export const SponsorshipBanner = ({ 
  page, 
  maxDisplay = 3, 
  autoScroll = true, 
  scrollInterval = 5000 
}: SponsorshipBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: sponsorships = [], isLoading } = useQuery({
    queryKey: ['sponsorships-banner', page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_settings')
        .select('*')
        .eq('key', 'sponsorships')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data || !data.value) {
        return [];
      }

      try {
        const parsedValue = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        const allSponsorships = Array.isArray(parsedValue) ? parsedValue : [];
        
        // Filter active sponsorships and sort by priority
        return allSponsorships
          .filter((s: Sponsorship) => s.is_active)
          .sort((a: Sponsorship, b: Sponsorship) => a.priority - b.priority);
      } catch (parseError) {
        console.error('Error parsing sponsorships:', parseError);
        return [];
      }
    }
  });

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || sponsorships.length <= maxDisplay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, sponsorships.length - maxDisplay);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, sponsorships.length, maxDisplay, scrollInterval]);

  if (isLoading || sponsorships.length === 0) {
    return null;
  }

  const visibleSponsorships = sponsorships.slice(currentIndex, currentIndex + maxDisplay);
  
  // If we don't have enough items from the slice, wrap around
  if (visibleSponsorships.length < maxDisplay && sponsorships.length > maxDisplay) {
    const remaining = maxDisplay - visibleSponsorships.length;
    visibleSponsorships.push(...sponsorships.slice(0, remaining));
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Sponsored</h3>
        {sponsorships.length > maxDisplay && (
          <div className="flex gap-1">
            {Array.from({ length: Math.ceil(sponsorships.length / maxDisplay) }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / maxDisplay) === index
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleSponsorships.map((sponsorship: Sponsorship) => (
          <Card
            key={`${sponsorship.id}-${currentIndex}`}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => window.open(sponsorship.sponsor_url, '_blank')}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {sponsorship.image_url && (
                  <img
                    src={sponsorship.image_url}
                    alt={sponsorship.title}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm truncate">{sponsorship.title}</h4>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  {sponsorship.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {sponsorship.description}
                    </p>
                  )}
                  <Badge variant="outline" className="text-xs mt-2">
                    Sponsored
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
