
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type Article = Tables<'knowledge_articles'> & { knowledge_categories: { name: string; slug: string } | null };

const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
    const { data, error } = await supabase
        .from('knowledge_articles')
        .select(`
            *,
            knowledge_categories ( name, slug )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data as Article | null;
}

const KnowledgeBaseArticle = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: article, isLoading, error } = useQuery({ 
        queryKey: ['knowledge_article', slug], 
        queryFn: () => fetchArticleBySlug(slug!),
        enabled: !!slug
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <div className="space-y-2 mt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-destructive">Error: {error.message}</div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground">Article Not Found</h2>
                    <p className="text-muted-foreground mt-2">The article you are looking for does not exist or is not published yet.</p>
                    <Button asChild variant="link" className="mt-4">
                        <Link to="/knowledge-base">Back to Knowledge Base</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Determine which content to display based on content_type
    const displayContent = article.content_type === 'html' 
        ? article.html_content 
        : article.content?.replace(/\n/g, '<br />');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
                <Button variant="outline" asChild>
                    <Link to="/knowledge-base">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Knowledge Base
                    </Link>
                </Button>
                
                <article className="bg-card border rounded-lg shadow-sm">
                    <header className="p-6 border-b">
                        {article.knowledge_categories && (
                            <Link 
                                to={`/knowledge-base?category=${article.knowledge_categories.slug}`} 
                                className="text-primary font-semibold hover:underline text-sm"
                            >
                                {article.knowledge_categories.name}
                            </Link>
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mt-2 mb-3">
                            {article.title}
                        </h1>
                        <p className="text-muted-foreground text-sm mb-4">
                            Published on {format(new Date(article.created_at), 'PPP')}
                        </p>
                        {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {article.tags.map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </header>
                    
                    <div className="p-6">
                        {article.image_url && (
                            <div className="mb-8 overflow-hidden rounded-lg">
                                <img 
                                    src={article.image_url} 
                                    alt={article.title} 
                                    className="w-full h-auto max-h-[450px] object-cover" 
                                />
                            </div>
                        )}
                        
                        <div 
                            className="article-content text-card-foreground"
                            dangerouslySetInnerHTML={{ __html: displayContent || '' }} 
                        />
                    </div>
                </article>
            </div>
        </div>
    );
}

export default KnowledgeBaseArticle;
