
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Shopping = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Shopping</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Personalized product recommendations and shopping lists will appear here soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p className="text-muted-foreground mt-2">
              We're working on bringing you a great shopping experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Shopping;
