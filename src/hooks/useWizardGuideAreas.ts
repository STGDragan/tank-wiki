
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WizardGuideArea {
  id: string;
  area_key: string;
  area_name: string;
  description: string | null;
  created_at: string;
}

export interface ArticleWizardGuide {
  id: string;
  article_id: string;
  guide_area_id: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const fetchWizardGuideAreas = async (): Promise<WizardGuideArea[]> => {
  const { data, error } = await supabase
    .from('wizard_guide_areas')
    .select('*')
    .order('area_name');
  
  if (error) throw new Error(error.message);
  return data;
};

const fetchArticleWizardGuides = async (articleId: string): Promise<ArticleWizardGuide[]> => {
  const { data, error } = await supabase
    .from('article_wizard_guides')
    .select('*')
    .eq('article_id', articleId)
    .order('display_order');
  
  if (error) throw new Error(error.message);
  return data;
};

export const useWizardGuideAreas = () => {
  return useQuery({
    queryKey: ['wizard_guide_areas'],
    queryFn: fetchWizardGuideAreas,
  });
};

export const useArticleWizardGuides = (articleId?: string) => {
  return useQuery({
    queryKey: ['article_wizard_guides', articleId],
    queryFn: () => fetchArticleWizardGuides(articleId!),
    enabled: !!articleId,
  });
};

export const useManageArticleWizardGuides = (articleId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guideAreaIds: string[]) => {
      if (!articleId) throw new Error('Article ID is required');

      // First, delete existing guides for this article
      const { error: deleteError } = await supabase
        .from('article_wizard_guides')
        .delete()
        .eq('article_id', articleId);

      if (deleteError) throw new Error(deleteError.message);

      // Then, insert new guides if any are selected
      if (guideAreaIds.length > 0) {
        const guidesToInsert = guideAreaIds.map((guideAreaId, index) => ({
          article_id: articleId,
          guide_area_id: guideAreaId,
          display_order: index,
          is_primary: index === 0, // First one is primary
        }));

        const { error: insertError } = await supabase
          .from('article_wizard_guides')
          .insert(guidesToInsert);

        if (insertError) throw new Error(insertError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article_wizard_guides', articleId] });
      toast.success('Wizard guide areas updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update wizard guide areas: ${error.message}`);
    },
  });
};
