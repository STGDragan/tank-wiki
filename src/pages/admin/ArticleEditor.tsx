
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/AuthProvider";

type Category = Tables<'knowledge_categories'>;
type Article = Tables<'knowledge_articles'>;

const articleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    content: z.string().optional(),
    status: z.enum(['draft', 'published']),
    category_id: z.string().uuid().nullable(),
    tags: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('knowledge_categories').select('*');
    if (error) throw new Error(error.message);
    return data;
};

const fetchArticle = async (id: string): Promise<Article | null> => {
    const { data, error } = await supabase.from('knowledge_articles').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
};

const ArticleEditor = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const { data: categories, isLoading: isLoadingCategories } = useQuery({ queryKey: ['knowledge_categories'], queryFn: fetchCategories });
    const { data: article, isLoading: isLoadingArticle } = useQuery({ 
        queryKey: ['knowledge_article', articleId], 
        queryFn: () => fetchArticle(articleId!),
        enabled: !!articleId 
    });

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            status: 'draft',
            category_id: null,
        }
    });

    useEffect(() => {
        if (article) {
            reset({
                ...article,
                tags: article.tags?.join(', ') || '',
            });
        } else {
            reset({
                title: '',
                slug: '',
                content: '',
                status: 'draft',
                category_id: null,
                tags: '',
            });
        }
    }, [article, reset]);

    const mutation = useMutation({
        mutationFn: async (data: ArticleFormData) => {
            const articleData = {
                ...data,
                content: data.content || null,
                tags: data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || null,
                author_id: user?.id,
                updated_at: new Date().toISOString(),
            };
            
            const { error } = articleId
                ? await supabase.from('knowledge_articles').update(articleData).eq('id', articleId)
                : await supabase.from('knowledge_articles').insert(articleData);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge_articles'] });
            toast.success(`Article ${articleId ? 'updated' : 'created'} successfully.`);
            navigate('/admin/knowledge-base');
        },
        onError: (error) => {
            toast.error(`Failed to ${articleId ? 'update' : 'create'} article: ${error.message}`);
        }
    });

    const onSubmit = (data: ArticleFormData) => {
        mutation.mutate(data);
    };
    
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setValue('title', title);
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setValue('slug', slug);
    }
    
    if (isLoadingCategories || (articleId && isLoadingArticle)) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{articleId ? "Edit Article" : "Create New Article"}</CardTitle>
                <CardDescription>
                    {articleId ? "Update the details of this article." : "Fill in the form to create a new article."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" {...register("title")} onChange={handleTitleChange} />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="content">Content</Label>
                                <Textarea id="content" {...register("content")} rows={15} />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" {...register("slug")} />
                                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div>
                                <Label htmlFor="category_id">Category</Label>
                                <Controller
                                    name="category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">No Category</SelectItem>
                                                {categories?.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                             <div>
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input id="tags" {...register("tags")} />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="ghost" onClick={() => navigate('/admin/knowledge-base')}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save Article'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ArticleEditor;
