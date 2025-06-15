import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useArticle, useCategories, useUpsertArticle } from "@/hooks/useKnowledgeBase";
import { articleSchema, ArticleFormData } from "@/lib/schemas/knowledgeBaseSchemas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ArticleEditor = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const navigate = useNavigate();
    
    const { data: categories, isLoading: isLoadingCategories } = useCategories();
    const { data: article, isLoading: isLoadingArticle } = useArticle(articleId);
    const mutation = useUpsertArticle(articleId);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            title: '',
            slug: '',
            content: '',
            status: 'draft',
            category_id: null,
            tags: '',
        }
    });

    useEffect(() => {
        if (article) {
            reset({
                ...article,
                status: article.status as 'draft' | 'published',
                tags: article.tags?.join(', ') || '',
                content: article.content ?? '',
                category_id: article.category_id ?? null,
            });
            setImageUrl(article.image_url);
        }
    }, [article, reset]);

    const onSubmit = (data: ArticleFormData) => {
        mutation.mutate({ ...data, image_url: imageUrl });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            toast.error("You must select an image to upload.");
            return;
        }

        const file = e.target.files[0];
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${fileName}`;

        setIsUploading(true);
        try {
            // Here we could delete the old image if it exists to save space.
            // For now, we will just upload the new one.
            const { error: uploadError } = await supabase.storage
                .from('knowledge_base_images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('knowledge_base_images')
                .getPublicUrl(filePath);
            
            setImageUrl(publicUrl);
            toast.success("Image uploaded successfully.");
        } catch (error: any) {
            toast.error("Image upload failed.", { description: error.message });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setValue('title', title);
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setValue('slug', slug);
    }
    
    if (isLoadingCategories || (articleId && isLoadingArticle)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-8 w-48" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-72" /></CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-[340px] w-full" />
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                         <div className="flex justify-end space-x-2 mt-6">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
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
                                        <Select
                                            onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                                            value={field.value ?? ''}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Category</SelectItem>
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
                            <div>
                                <Label htmlFor="image">Main Image</Label>
                                {imageUrl && (
                                    <div className="my-2 relative group">
                                        <img src={imageUrl} alt="Article main image" className="w-full h-auto rounded-md object-cover" />
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                                            onClick={() => setImageUrl(null)}
                                            type="button"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                                <Input id="image" type="file" onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                                {isUploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="ghost" onClick={() => navigate('/admin/knowledge-base')}>
                            <ArrowLeft />
                            Back
                        </Button>
                        <Button type="submit" disabled={mutation.isPending || isUploading}>
                            {isUploading ? 'Uploading...' : (mutation.isPending ? 'Saving...' : 'Save Article')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ArticleEditor;
