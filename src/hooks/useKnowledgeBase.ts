
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ArticleFormData, CategoryFormData } from "@/lib/schemas/knowledgeBaseSchemas";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

type Category = Tables<'knowledge_categories'>;
type Article = Tables<'knowledge_articles'>;

// Categories
const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('knowledge_categories').select('*');
    if (error) throw new Error(error.message);
    return data;
};

export const useCategories = () => {
    return useQuery({ queryKey: ['knowledge_categories'], queryFn: fetchCategories });
};

export const useUpsertCategory = (category: Category | null) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CategoryFormData) => {
            if (category) {
                const updateData = { ...data, description: data.description || null };
                const { error } = await supabase.from('knowledge_categories').update(updateData).eq('id', category.id);
                if (error) throw new Error(error.message);
            } else {
                const insertData = { name: data.name, slug: data.slug, description: data.description || null };
                const { error } = await supabase.from('knowledge_categories').insert(insertData);
                if (error) throw new Error(error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge_categories'] });
            toast.success(`Category ${category ? 'updated' : 'created'} successfully.`);
        },
        onError: (error) => {
            toast.error(`Failed to ${category ? 'update' : 'create'} category: ${error.message}`);
        }
    });
};


// Articles
const fetchArticle = async (id: string): Promise<Article | null> => {
    const { data, error } = await supabase.from('knowledge_articles').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
};

export const useArticle = (articleId?: string) => {
    return useQuery({ 
        queryKey: ['knowledge_article', articleId], 
        queryFn: () => fetchArticle(articleId!),
        enabled: !!articleId 
    });
};

export const useUpsertArticle = (articleId?: string) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data: ArticleFormData) => {
            const processedData = {
                ...data,
                content: data.content || null,
                tags: data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || null,
            };

            if (articleId) {
                const { error } = await supabase.from('knowledge_articles').update(processedData).eq('id', articleId);
                if (error) throw new Error(error.message);
            } else {
                const insertData = {
                    ...processedData,
                    author_id: user?.id,
                };
                const { error } = await supabase.from('knowledge_articles').insert(insertData);
                if (error) throw new Error(error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge_articles'] });
            if (articleId) {
              queryClient.invalidateQueries({ queryKey: ['knowledge_article', articleId] });
            }
            toast.success(`Article ${articleId ? 'updated' : 'created'} successfully.`);
            navigate('/admin/knowledge-base');
        },
        onError: (error) => {
            toast.error(`Failed to ${articleId ? 'update' : 'create'} article: ${error.message}`);
        }
    });
}
