
import FeaturedProducts from "@/components/shopping/FeaturedProducts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ShoppingRecommendations from "@/components/shopping/ShoppingRecommendations";

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
            Product recommendations and shopping lists based on aquarium type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShoppingRecommendations />
        </CardContent>
      </Card>
    </div>
  );
};

export default Shopping;
