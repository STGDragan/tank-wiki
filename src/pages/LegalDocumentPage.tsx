
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';

const LegalDocumentPage = () => {
  const { document_type } = useParams<{ document_type: string }>();

  const { data: document, isLoading } = useQuery({
    queryKey: ['legal_document', document_type],
    queryFn: async () => {
      if (!document_type) return null;
      const { data, error } = await (supabase as any)
        .from('legal_documents')
        .select('title, content')
        .eq('document_type', document_type)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found is ok
        throw error;
      }
      return data;
    },
    enabled: !!document_type
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-3xl space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-3xl text-center">
        <h1 className="text-2xl font-bold">Document not found</h1>
        <p>The document you are looking for does not exist or has not been published.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-3xl">
        <article className="prose dark:prose-invert max-w-none">
            <h1>{document.title}</h1>
            <ReactMarkdown>{document.content || ""}</ReactMarkdown>
        </article>
    </div>
  );
};

export default LegalDocumentPage;
