
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Product = Tables<'products'>;

const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .order("category");

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const groupProductsByCategory = (products: Product[]) => {
  return products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
}

const FeaturedProducts = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p>Error loading featured products: {error.message}</p>;
  }
  
  const productsByCategory = groupProductsByCategory(products);

  return (
    <div className="space-y-8">
      {Object.keys(productsByCategory).length > 0 ? (
        Object.entries(productsByCategory).map(([category, productsInCategory]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold tracking-tight mb-4">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productsInCategory.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square">
                      <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                    {product.description && <CardDescription className="truncate">{product.description}</CardDescription>}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
         <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No Featured Products Yet</h2>
            <p className="text-muted-foreground mt-2">
              Check back later or ask an admin to feature some products.
            </p>
          </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
