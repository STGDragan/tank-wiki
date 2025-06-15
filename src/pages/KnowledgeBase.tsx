
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const KnowledgeBase = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Explore articles, guides, and a glossary to enhance your aquarium hobby.
        </p>
      </div>
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="glossary">Glossary</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>Articles</CardTitle>
              <CardDescription>
                In-depth articles about aquarium keeping, fish health, and plant care.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">Coming Soon</h2>
                <p className="text-muted-foreground mt-2">
                  We're working on bringing you insightful articles.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>Guides</CardTitle>
              <CardDescription>
                Step-by-step guides for setting up and maintaining different types of aquariums.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">Coming Soon</h2>
                <p className="text-muted-foreground mt-2">
                  Guides for freshwater, saltwater, and planted tanks are on the way.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="glossary">
          <Card>
            <CardHeader>
              <CardTitle>Glossary</CardTitle>
              <CardDescription>
                A comprehensive glossary of aquarium-related terms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">Coming Soon</h2>
                <p className="text-muted-foreground mt-2">
                  Our glossary is being compiled to help you understand all the jargon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBase;
