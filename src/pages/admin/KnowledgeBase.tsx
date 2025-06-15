
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleList } from "@/components/admin/knowledge-base/ArticleList";
import { CategoryList } from "@/components/admin/knowledge-base/CategoryList";

const AdminKnowledgeBase = () => {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Knowledge Base Management</h1>
                <p className="text-muted-foreground">
                    Manage articles and categories for the knowledge base.
                </p>
            </div>
            <Tabs defaultValue="articles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="articles">Articles</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="articles">
                    <ArticleList />
                </TabsContent>
                <TabsContent value="categories">
                    <CategoryList />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminKnowledgeBase;
