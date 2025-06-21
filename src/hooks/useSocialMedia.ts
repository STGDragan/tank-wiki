
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SocialMediaLink {
  id: string;
  platform: 'email' | 'facebook' | 'instagram' | 'tiktok' | 'youtube';
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSocialMediaLinks = () => {
  return useQuery({
    queryKey: ['social_media_links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('is_active', true)
        .order('platform');
      if (error) throw error;
      return data as SocialMediaLink[];
    },
  });
};

export const useAllSocialMediaLinks = () => {
  return useQuery({
    queryKey: ['all_social_media_links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .order('platform');
      if (error) throw error;
      return data as SocialMediaLink[];
    },
  });
};

export const useUpsertSocialMediaLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { platform: string; url: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('social_media_links')
        .upsert(values, { onConflict: 'platform' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Social media link updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['social_media_links'] });
      queryClient.invalidateQueries({ queryKey: ['all_social_media_links'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update social media link.');
    }
  });
};
