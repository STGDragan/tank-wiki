
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
        
        return allSponsorships
          .filter((s: Sponsorship) => s.is_active)
          .sort((a: Sponsorship, b: Sponsorship) => a.priority - b.priority);
      } catch (parseError) {
        console.error('Error parsing sponsorships:', parseError);
        return [];
      }
    }
  });

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
    <div className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden py-4">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative px-6">
        <div className="flex items-center justify-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800 font-medium">
              SPONSORED
            </Badge>
            <div 
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(currentSponsorship.sponsor_url, '_blank')}
            >
              {currentSponsorship.image_url && (
                <img
                  src={currentSponsorship.image_url}
                  alt={currentSponsorship.title}
                  className="h-[90px] w-[728px] object-contain rounded border-2 border-white/20"
                  style={{ maxWidth: '728px', maxHeight: '90px' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex items-center gap-3">
                <span className="font-bold text-white text-lg">{currentSponsorship.title}</span>
                {currentSponsorship.description && (
                  <>
                    <span className="text-white/60 text-2xl">•</span>
                    <span className="text-white/90 hidden md:inline-block font-medium">
                      {currentSponsorship.description}
                    </span>
                  </>
                )}
                <ExternalLink className="h-5 w-5 text-white/80" />
              </div>
            </div>
          </div>
          
          {sponsorships.length > 1 && (
            <div className="flex gap-2 ml-6">
              {sponsorships.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? 'bg-white shadow-lg scale-110'
                      : 'bg-white/40 hover:bg-white/60'
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
