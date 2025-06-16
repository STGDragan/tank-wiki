
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SlideshowSettings } from "@/types/slideshow";

export function useSlideshowSettings() {
  return useQuery({
    queryKey: ["slideshow_settings"],
    queryFn: async (): Promise<SlideshowSettings | null> => {
      const { data, error } = await supabase
        .from("slideshow_settings")
        .select("*")
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
  });
}
