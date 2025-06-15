
import FeaturedProducts from "@/components/shopping/FeaturedProducts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Shopping = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Shopping</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Featured Items</CardTitle>
          <CardDescription>
            Hand-picked products you might like.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeaturedProducts />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Personalized product recommendations and shopping lists will appear
            here soon!
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
