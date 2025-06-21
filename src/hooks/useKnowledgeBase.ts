
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
const fetchArticleById = async (id: string): Promise<Article | null> => {
    const { data, error } = await supabase.from('knowledge_articles').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
};

const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
    const { data, error } = await supabase.from('knowledge_articles').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
};

export const useArticle = (identifier?: string, bySlug = false) => {
    return useQuery({ 
        queryKey: ['knowledge_article', identifier, bySlug], 
        queryFn: () => bySlug ? fetchArticleBySlug(identifier!) : fetchArticleById(identifier!),
        enabled: !!identifier 
    });
};

export const useUpsertArticle = (identifier?: string, bySlug = false) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data: ArticleFormData & { image_url?: string | null }) => {
            const payload = {
                title: data.title,
                slug: data.slug,
                status: data.status,
                category_id: data.category_id,
                content: data.content_type === 'text' ? data.content || null : null,
                html_content: data.content_type === 'html' ? data.html_content || null : null,
                content_type: data.content_type,
                tldr: data.tldr || null,
                tags: data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || null,
                image_url: data.image_url,
            };

            if (identifier) {
                // If we have an identifier, we're updating an existing article
                const whereClause = bySlug ? 'slug' : 'id';
                const { error } = await supabase.from('knowledge_articles').update(payload).eq(whereClause, identifier);
                if (error) throw new Error(error.message);
            } else {
                const insertData = {
                    ...payload,
                    author_id: user?.id ?? null,
                };
                const { error } = await supabase.from('knowledge_articles').insert(insertData);
                if (error) throw new Error(error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge_articles'] });
            if (identifier) {
              queryClient.invalidateQueries({ queryKey: ['knowledge_article', identifier, bySlug] });
            }
            toast.success(`Article ${identifier ? 'updated' : 'created'} successfully.`);
            navigate('/admin/knowledge-base');
        },
        onError: (error) => {
            toast.error(`Failed to ${identifier ? 'update' : 'create'} article: ${error.message}`);
        }
    });
}
