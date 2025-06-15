
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
        );
    }
    
    if (error) {
        return <div className="text-destructive">Error: {error.message}</div>;
    }

    if (!article) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Article Not Found</h2>
                <p className="text-muted-foreground mt-2">The article you are looking for does not exist or is not published yet.</p>
                <Button asChild variant="link" className="mt-4">
                    <Link to="/knowledge-base">Back to Knowledge Base</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <Button variant="outline" asChild>
                <Link to="/knowledge-base">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Knowledge Base
                </Link>
            </Button>
            <article>
                <header className="mb-8 border-b pb-4">
                    {article.knowledge_categories && (
                        <Link to={`/knowledge-base?category=${article.knowledge_categories.slug}`} className="text-primary font-semibold hover:underline">
                            {article.knowledge_categories.name}
                        </Link>
                    )}
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mt-2">{article.title}</h1>
                    <p className="text-muted-foreground mt-2">
                        Published on {format(new Date(article.created_at), 'PPP')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {article.tags?.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                </header>
                <div 
                    className="prose dark:prose-invert max-w-none" 
                    dangerouslySetInnerHTML={{ __html: article.content?.replace(/\n/g, '<br />') || '' }} 
                />
            </article>
        </div>
    );
}

export default KnowledgeBaseArticle;
