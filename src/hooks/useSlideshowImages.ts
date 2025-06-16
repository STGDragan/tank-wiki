
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SlideshowImage } from "@/types/slideshow";

export function useSlideshowImages(context: string) {
  return useQuery({
    queryKey: ["slideshow_images", context],
    queryFn: async (): Promise<SlideshowImage[]> => {
      const { data, error } = await supabase
        .from("slideshow_images")
        .select("id, image_url, alt_text, context, display_order, created_at, updated_at")
        .eq("context", context)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}
