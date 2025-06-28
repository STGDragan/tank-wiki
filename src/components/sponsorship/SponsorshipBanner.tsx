
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
    if (!autoScroll || sponsorships.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsorships.length);
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, sponsorships.length, scrollInterval]);

  if (isLoading || sponsorships.length === 0) {
    return null;
  }

  const currentSponsorship = sponsorships[currentIndex];

  return (
    <div className="w-full bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs bg-background">
              Sponsored
            </Badge>
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(currentSponsorship.sponsor_url, '_blank')}
            >
              {currentSponsorship.image_url && (
                <img
                  src={currentSponsorship.image_url}
                  alt={currentSponsorship.title}
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{currentSponsorship.title}</span>
                {currentSponsorship.description && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground hidden md:inline">
                      {currentSponsorship.description}
                    </span>
                  </>
                )}
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          {sponsorships.length > 1 && (
            <div className="flex gap-1">
              {sponsorships.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                    currentIndex === index
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
