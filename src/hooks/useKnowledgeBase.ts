
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
            console.log('Saving category with data:', data);
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
            console.error('Category save error:', error);
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

const fetchArticleWithWizardGuides = async (identifier: string, bySlug: boolean): Promise<(Article & { wizard_guide_areas?: string[] }) | null> => {
    // First get the article
    const article = bySlug ? await fetchArticleBySlug(identifier) : await fetchArticleById(identifier);
    
    if (!article) return null;

    // Then get associated wizard guide areas
    const { data: wizardGuides, error } = await supabase
        .from('article_wizard_guides')
        .select('guide_area_id')
        .eq('article_id', article.id)
        .order('display_order');

    if (error) {
        console.error('Error fetching wizard guides:', error);
        return { ...article, wizard_guide_areas: [] };
    }

    return {
        ...article,
        wizard_guide_areas: wizardGuides?.map(guide => guide.guide_area_id) || []
    };
};

export const useArticle = (identifier?: string, bySlug = false) => {
    return useQuery({ 
        queryKey: ['knowledge_article', identifier, bySlug], 
        queryFn: () => fetchArticleWithWizardGuides(identifier!, bySlug),
        enabled: !!identifier 
    });
};

export const useUpsertArticle = (identifier?: string, bySlug = false) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data: ArticleFormData & { image_url?: string | null }) => {
            console.log('Saving article with data:', data);
            console.log('Content type:', data.content_type);
            console.log('Content:', data.content);
            console.log('HTML Content:', data.html_content);
            
            const payload = {
                title: data.title,
                slug: data.slug,
                status: data.status,
                category_id: data.category_id,
                content: data.content_type === 'text' ? (data.content || null) : null,
                html_content: data.content_type === 'html' ? (data.html_content || null) : null,
                content_type: data.content_type,
                tldr: data.tldr || null,
                tags: data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || null,
                image_url: data.image_url,
            };

            console.log('Final payload to save:', payload);

            let articleId: string;

            if (identifier) {
                // If we have an identifier, we're updating an existing article
                const whereClause = bySlug ? 'slug' : 'id';
                console.log('Updating article with whereClause:', whereClause, 'identifier:', identifier);
                const { data: updateResult, error } = await supabase
                    .from('knowledge_articles')
                    .update(payload)
                    .eq(whereClause, identifier)
                    .select();
                
                if (error) {
                    console.error('Update error:', error);
                    throw new Error(error.message);
                }
                console.log('Update result:', updateResult);
                
                // Get the article ID for wizard guides update
                if (bySlug) {
                    const { data: article, error: fetchError } = await supabase
                        .from('knowledge_articles')
                        .select('id')
                        .eq('slug', identifier)
                        .single();
                    if (fetchError) throw new Error(fetchError.message);
                    articleId = article.id;
                } else {
                    articleId = identifier;
                }
            } else {
                const insertData = {
                    ...payload,
                    author_id: user?.id ?? null,
                };
                console.log('Inserting new article with data:', insertData);
                const { data: newArticle, error } = await supabase
                    .from('knowledge_articles')
                    .insert(insertData)
                    .select('id')
                    .single();
                
                if (error) {
                    console.error('Insert error:', error);
                    throw new Error(error.message);
                }
                console.log('Insert result:', newArticle);
                articleId = newArticle.id;
            }

            // Update wizard guide areas if provided
            if (data.wizard_guide_areas) {
                console.log('Updating wizard guide areas:', data.wizard_guide_areas);
                // Delete existing wizard guides
                await supabase
                    .from('article_wizard_guides')
                    .delete()
                    .eq('article_id', articleId);

                // Insert new wizard guides
                if (data.wizard_guide_areas.length > 0) {
                    const guidesToInsert = data.wizard_guide_areas.map((guideAreaId, index) => ({
                        article_id: articleId,
                        guide_area_id: guideAreaId,
                        display_order: index,
                        is_primary: index === 0,
                    }));

                    const { error: guideError } = await supabase
                        .from('article_wizard_guides')
                        .insert(guidesToInsert);
                    
                    if (guideError) throw new Error(guideError.message);
                }
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
            console.error('Article save error:', error);
            toast.error(`Failed to ${identifier ? 'update' : 'create'} article: ${error.message}`);
        }
    });
}
