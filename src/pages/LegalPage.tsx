
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

const LegalPage = () => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['legal_documents'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('legal_documents')
        .select('title, document_type')
        .filter('content', 'is not', null);
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-3xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Legal Documents</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {documents?.map((doc: any) => (
              <Link key={doc.document_type} to={`/legal/${doc.document_type}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{doc.title}</CardTitle>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
            {documents?.length === 0 && <p>No legal documents have been published yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalPage;
