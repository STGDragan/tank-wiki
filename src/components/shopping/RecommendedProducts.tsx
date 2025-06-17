
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp } from "lucide-react";

const fetchRecommendedProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_recommended", true)
    .eq("visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recommended products:", error);
    throw new Error(error.message);
  }
  return data;
};

const RecommendedProducts = () => {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recommended-products"],
    queryFn: fetchRecommendedProducts,
  });

  const truncateDescription = (description: string | null, maxLength: number = 100) => {
    if (!description) return "";
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + '...';
  };

  if (error) {
    return <div>Error loading recommended products: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Recommended Products</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[300px]">
              <CardHeader className="p-0">
                <Skeleton className="h-32 w-full rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
              <CardFooter className="p-4 pt-2">
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <ThumbsUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No recommended products available at the moment.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ThumbsUp className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-semibold">Recommended Products</h3>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full px-12"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="h-[300px] flex flex-col">
                  <CardHeader className="p-0 flex-shrink-0">
                    <img 
                      src={product.image_url || "/placeholder.svg"} 
                      alt={product.name} 
                      className="rounded-t-lg h-32 object-cover w-full" 
                    />
                  </CardHeader>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold line-clamp-2 text-sm">{product.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-4">
                        {truncateDescription(product.description)}
                      </p>
                      {product.price && (
                        <p className="text-sm font-medium text-primary">
                          ${product.price}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 flex-shrink-0">
                    <Button variant="outline" className="w-full text-xs h-8">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RecommendedProducts;
