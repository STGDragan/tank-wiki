
import { LegalDocumentEditor } from "@/components/admin/LegalDocumentEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const legalDocsToManage = [
  { type: 'terms-of-service', title: 'Terms of Service' },
  { type: 'privacy-policy', title: 'Privacy Policy' },
];

const AdminLegal = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Legal Documents</h1>
        <p className="text-muted-foreground">
          Manage your legal documents from here.
        </p>
      </div>
      <Tabs defaultValue={legalDocsToManage[0].type} className="w-full">
        <TabsList>
          {legalDocsToManage.map(doc => (
            <TabsTrigger key={doc.type} value={doc.type}>{doc.title}</TabsTrigger>
          ))}
        </TabsList>
        {legalDocsToManage.map(doc => (
          <TabsContent key={doc.type} value={doc.type}>
            <LegalDocumentEditor documentType={doc.type} documentTitle={doc.title} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminLegal;
