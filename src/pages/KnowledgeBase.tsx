
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Article = Pick<Tables<'knowledge_articles'>, 'id' | 'title' | 'slug' | 'status'>;
type Category = Tables<'knowledge_categories'> & { knowledge_articles: Article[] };

const fetchKnowledgeData = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('knowledge_categories')
        .select(`
            *,
            knowledge_articles (
                id,
                title,
                slug,
                status
            )
        `)
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    // Filter for published articles only
    const categoriesWithPublishedArticles = data.map(category => ({
        ...category,
        knowledge_articles: category.knowledge_articles.filter(article => article.status === 'published')
    })).filter(category => category.knowledge_articles.length > 0);

    return categoriesWithPublishedArticles;
};

const KnowledgeBase = () => {
  const { data: categories, isLoading, error } = useQuery({ queryKey: ['knowledge_base_public'], queryFn: fetchKnowledgeData });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Explore articles, guides, and a glossary to enhance your aquarium hobby.
        </p>
      </div>
      
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
            <h2 className="text-xl font-semibold">No Articles Yet</h2>
            <p className="text-muted-foreground mt-2">
                We're working on bringing you insightful articles. Check back soon!
            </p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
