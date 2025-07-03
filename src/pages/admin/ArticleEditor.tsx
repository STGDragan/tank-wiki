
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
import { ArrowLeft, Save } from "lucide-react";
import { useArticle, useCategories, useUpsertArticle } from "@/hooks/useKnowledgeBase";
import { articleSchema, ArticleFormData } from "@/lib/schemas/knowledgeBaseSchemas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/knowledge-base/RichTextEditor";
import { WizardGuideAreaSelector } from "@/components/admin/knowledge-base/WizardGuideAreaSelector";

const ArticleEditor = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    
    const { data: categories, isLoading: isLoadingCategories } = useCategories();
    const { data: article, isLoading: isLoadingArticle } = useArticle(slug, true);
    const mutation = useUpsertArticle(slug, true);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, reset, setValue, control, watch, formState: { errors } } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            title: '',
            slug: '',
            content: '',
            html_content: '',
            content_type: 'text',
            tldr: '',
            status: 'draft',
            category_id: null,
            tags: '',
            wizard_guide_areas: [],
        }
    });

    const contentType = watch('content_type');
    const wizardGuideAreas = watch('wizard_guide_areas') || [];

    useEffect(() => {
        if (article) {
            reset({
                ...article,
                status: article.status as 'draft' | 'published',
                tags: article.tags?.join(', ') || '',
                content: article.content ?? '',
                html_content: article.html_content ?? '',
                content_type: (article.content_type as 'text' | 'html') ?? 'text',
                tldr: article.tldr ?? '',
                category_id: article.category_id ?? null,
                wizard_guide_areas: article.wizard_guide_areas || [],
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
    
    if (isLoadingCategories || (slug && isLoadingArticle)) {
        return (
            <div className="container mx-auto px-4 py-8 mobile-nav-space">
                <Card className="cyber-card glass-panel">
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
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 mobile-nav-space">
            {/* Header with action buttons */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/knowledge-base')}
                    className="text-muted-foreground hover:text-foreground cyber-button"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Knowledge Base
                </Button>
                
                <Button 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={mutation.isPending || isUploading}
                    className="cyber-button"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : (mutation.isPending ? 'Saving...' : 'Save Article')}
                </Button>
            </div>

            <Card className="cyber-card glass-panel">
                <CardHeader>
                    <CardTitle className="font-display text-primary">
                        {slug ? "Edit Article" : "Create New Article"}
                    </CardTitle>
                    <CardDescription className="font-mono">
                        {slug ? "Update the details of this article." : "Fill in the form to create a new article."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <Label htmlFor="title" className="font-mono">Title</Label>
                                    <Input 
                                        id="title" 
                                        {...register("title")} 
                                        onChange={handleTitleChange} 
                                        className="cyber-input"
                                    />
                                    {errors.title && <p className="text-red-400 text-sm mt-1 font-mono">{errors.title.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="tldr" className="font-mono">TL/DR Summary</Label>
                                    <Textarea 
                                        id="tldr" 
                                        {...register("tldr")} 
                                        rows={3}
                                        placeholder="Brief summary of the article for quick reference and wizard integration..."
                                        className="cyber-input"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                                        This summary will be used in the aquarium setup wizard and quick previews.
                                    </p>
                                </div>
                                <Controller
                                    name={contentType === 'html' ? 'html_content' : 'content'}
                                    control={control}
                                    render={({ field }) => (
                                        <RichTextEditor
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            contentType={contentType}
                                            onContentTypeChange={(type) => setValue('content_type', type)}
                                            placeholder="Enter your article content here..."
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="slug" className="font-mono">Slug</Label>
                                    <Input 
                                        id="slug" 
                                        {...register("slug")} 
                                        className="cyber-input"
                                    />
                                    {errors.slug && <p className="text-red-400 text-sm mt-1 font-mono">{errors.slug.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="status" className="font-mono">Status</Label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="cyber-input">
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
                                    <Label htmlFor="category_id" className="font-mono">Category</Label>
                                    <Controller
                                        name="category_id"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                                                value={field.value ?? ''}
                                            >
                                                <SelectTrigger className="cyber-input">
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
                                    <Label htmlFor="tags" className="font-mono">Tags (comma-separated)</Label>
                                    <Input 
                                        id="tags" 
                                        {...register("tags")} 
                                        className="cyber-input"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image" className="font-mono">Main Image</Label>
                                    {imageUrl && (
                                        <div className="my-2 relative group">
                                            <img src={imageUrl} alt="Article main image" className="w-full h-auto rounded-md object-cover neon-border" />
                                            <Button 
                                                variant="destructive" 
                                                size="sm" 
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cyber-button" 
                                                onClick={() => setImageUrl(null)}
                                                type="button"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                    <Input 
                                        id="image" 
                                        type="file" 
                                        onChange={handleImageUpload} 
                                        disabled={isUploading} 
                                        accept="image/*" 
                                        className="cyber-input"
                                    />
                                    {isUploading && <p className="text-sm text-muted-foreground mt-1 font-mono">Uploading...</p>}
                                </div>
                            </div>
                        </div>

                        {/* Wizard Guide Areas Section */}
                        <WizardGuideAreaSelector
                            selectedAreas={wizardGuideAreas}
                            onChange={(areas) => setValue('wizard_guide_areas', areas)}
                        />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ArticleEditor;
