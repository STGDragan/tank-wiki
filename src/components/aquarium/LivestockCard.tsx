
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Button } from '@/components/ui/button';
import { Plus, Skull, Trash2, ExternalLink, ShoppingCart } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Livestock = Tables<'livestock'>;

interface LivestockCardProps {
  livestock: Livestock;
  onUpdateQuantity: (livestockId: string, currentQuantity: number, change: number) => void;
  onDelete: (livestockId: string) => void;
}

const fetchRelatedProduct = async (species: string) => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      affiliate_links (
        link_url,
        provider
      )
    `)
    .ilike('name', `%${species}%`)
    .eq('visible', true)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching related product:", error);
    return null;
  }
  return data;
};

export const LivestockCard = ({ livestock, onUpdateQuantity, onDelete }: LivestockCardProps) => {
  const { data: relatedProduct } = useQuery({
    queryKey: ['related-product', livestock.species],
    queryFn: () => fetchRelatedProduct(livestock.species),
  });

  const handleProductClick = () => {
    if (relatedProduct?.affiliate_links?.[0]?.link_url) {
      window.open(relatedProduct.affiliate_links[0].link_url, '_blank');
    }
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 cursor-pointer" onClick={handleProductClick}>
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">{livestock.species}</h3>
            {livestock.name && (
              <p className="text-sm text-muted-foreground">"{livestock.name}"</p>
            )}
            {relatedProduct && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">Related Product Available</p>
                {relatedProduct.affiliate_links?.[0] && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <ShoppingCart className="h-3 w-3" />
                    <span>Buy on {relatedProduct.affiliate_links[0].provider || 'Store'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(livestock.id, livestock.quantity, -1)}>
              <Skull className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg min-w-[2rem] text-center">{livestock.quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(livestock.id, livestock.quantity, 1)}>
              <Plus className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8 ml-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove {livestock.species} from your aquarium. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(livestock.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
