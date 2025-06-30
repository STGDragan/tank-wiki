
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
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-32 bg-gray-800" />
                        <Skeleton className="h-12 w-3/4 bg-gray-800" />
                        <Skeleton className="h-6 w-1/4 bg-gray-800" />
                        <div className="space-y-2 mt-4">
                            <Skeleton className="h-4 w-full bg-gray-800" />
                            <Skeleton className="h-4 w-full bg-gray-800" />
                            <Skeleton className="h-4 w-5/6 bg-gray-800" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-red-400">Error: {error.message}</div>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-white">Article Not Found</h2>
                        <p className="text-gray-400 mt-2">The article you are looking for does not exist or is not published yet.</p>
                        <Button asChild variant="link" className="mt-4 text-cyan-400 hover:text-cyan-300">
                            <Link to="/knowledge-base">Back to Knowledge Base</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Determine which content to display based on content_type
    const displayContent = article.content_type === 'html' 
        ? article.html_content 
        : article.content?.replace(/\n/g, '<br />');

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    <Button variant="outline" asChild className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                        <Link to="/knowledge-base">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Knowledge Base
                        </Link>
                    </Button>
                    
                    <article className="bg-gray-800 border-2 border-cyan-500/50 rounded-lg shadow-sm">
                        <header className="p-6 border-b border-gray-700">
                            {article.knowledge_categories && (
                                <Link 
                                    to={`/knowledge-base?category=${article.knowledge_categories.slug}`} 
                                    className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline text-sm transition-colors"
                                >
                                    {article.knowledge_categories.name}
                                </Link>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-3">
                                {article.title}
                            </h1>
                            <p className="text-gray-400 text-sm mb-4">
                                Published on {format(new Date(article.created_at), 'PPP')}
                            </p>
                            {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                                            {tag}
                                        </Badge>
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
                                className="article-content text-white prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: displayContent || '' }} 
                            />
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}

export default KnowledgeBaseArticle;
