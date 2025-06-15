
import { LegalDocumentEditor } from "@/components/admin/LegalDocumentEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AddLegalDocumentDialog } from "@/components/admin/AddLegalDocumentDialog";
import { FileText } from "lucide-react";
import { useLegalDocuments } from "@/hooks/useLegal";

const AdminLegal = () => {
  const { data: legalDocs, isLoading } = useLegalDocuments();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-semibold">Legal Documents</h1>
                <p className="text-muted-foreground">
                Manage your legal documents from here.
                </p>
            </div>
            <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">Legal Documents</h1>
          <p className="text-muted-foreground">
            Manage your legal documents from here.
          </p>
        </div>
        <AddLegalDocumentDialog />
      </div>

      {legalDocs && legalDocs.length > 0 ? (
        <Tabs defaultValue={legalDocs[0].document_type} className="w-full">
          <TabsList>
            {legalDocs.map(doc => (
              <TabsTrigger key={doc.document_type} value={doc.document_type}>{doc.title}</TabsTrigger>
            ))}
          </TabsList>
          {legalDocs.map(doc => (
            <TabsContent key={doc.document_type} value={doc.document_type}>
              <LegalDocumentEditor documentType={doc.document_type} documentTitle={doc.title} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You have not created any legal documents yet.
            </p>
            <AddLegalDocumentDialog />
        </div>
      )}
    </div>
  );
};

export default AdminLegal;
