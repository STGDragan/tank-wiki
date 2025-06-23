
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SlideshowSection } from "@/components/landing/SlideshowSection";
import { SearchBar } from "@/components/knowledge-base/SearchBar";
import { useState } from "react";

type Article = Pick<Tables<'knowledge_articles'>, 'id' | 'title' | 'slug' | 'status' | 'content' | 'html_content' | 'content_type' | 'tags'>;
type Category = Tables<'knowledge_categories'> & { knowledge_articles: Article[] };

const fetchKnowledgeData = async (searchQuery?: string): Promise<Category[]> => {
    let query = supabase
        .from('knowledge_categories')
        .select(`
            *,
            knowledge_articles (
                id,
                title,
                slug,
                status,
                content,
                html_content,
                content_type,
                tags
            )
        `)
        .order('name', { ascending: true });

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // Filter for published articles and apply search
    const categoriesWithPublishedArticles = data.map(category => ({
        ...category,
        knowledge_articles: category.knowledge_articles
            .filter(article => article.status === 'published')
            .filter(article => {
                if (!searchQuery) return true;
                
                const searchLower = searchQuery.toLowerCase();
                const titleMatch = article.title.toLowerCase().includes(searchLower);
                const contentMatch = article.content?.toLowerCase().includes(searchLower) || 
                                   article.html_content?.toLowerCase().includes(searchLower);
                const tagMatch = article.tags?.some(tag => tag.toLowerCase().includes(searchLower));
                
                return titleMatch || contentMatch || tagMatch;
            })
    })).filter(category => category.knowledge_articles.length > 0);

    return categoriesWithPublishedArticles;
};

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: categories, isLoading, error, refetch } = useQuery({ 
    queryKey: ['knowledge_base_public', searchQuery], 
    queryFn: () => fetchKnowledgeData(searchQuery) 
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-8">
      <div className="w-full h-[250px] rounded-lg overflow-hidden">
        <SlideshowSection context="knowledge-base" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Explore articles, guides, and a glossary to enhance your aquarium hobby.
        </p>
      </div>
      
      <SearchBar onSearch={handleSearch} placeholder="Search articles by title, content, or tags..." />
      
      {isLoading && (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      )}

      {error && (
        <Card>
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">Could not load knowledge base articles. Please try again later.</p>
                <p className="text-xs text-muted-foreground mt-2">{error.message}</p>
            </CardContent>
        </Card>
      )}

      {categories && categories.length > 0 && (
        <Accordion type="single" collapsible className="w-full" defaultValue={categories[0].id}>
          {categories.map(category => (
            <AccordionItem value={category.id} key={category.id}>
              <AccordionTrigger className="text-xl font-semibold">{category.name}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.knowledge_articles.map(article => (
                    <li key={article.id}>
                      <Link to={`/knowledge-base/${article.slug}`} className="text-primary hover:underline">
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {categories && categories.length === 0 && !isLoading && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">
              {searchQuery ? 'No articles found' : 'No Articles Yet'}
            </h2>
            <p className="text-muted-foreground mt-2">
                {searchQuery 
                  ? `No articles match your search for "${searchQuery}". Try different keywords.`
                  : 'We\'re working on bringing you insightful articles. Check back soon!'
                }
            </p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
