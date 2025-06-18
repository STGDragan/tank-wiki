
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, ShoppingCart } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Equipment = Tables<'equipment'>;

interface EquipmentCardProps {
  equipment: Equipment;
  onDelete: (equipmentId: string) => void;
}

const fetchRelatedProduct = async (type: string, brand?: string, model?: string) => {
  let query = supabase
    .from("products")
    .select(`
      *,
      affiliate_links (
        link_url,
        provider
      )
    `)
    .eq('visible', true);

  // Search by type first
  if (type) {
    query = query.ilike('name', `%${type}%`);
  }

  // If we have brand and model, refine the search
  if (brand && model) {
    query = query.or(`name.ilike.%${brand}%,name.ilike.%${model}%`);
  } else if (brand) {
    query = query.ilike('name', `%${brand}%`);
  }

  const { data, error } = await query.limit(1).single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching related product:", error);
    return null;
  }
  return data;
};

export const EquipmentCard = ({ equipment, onDelete }: EquipmentCardProps) => {
  const { data: relatedProduct } = useQuery({
    queryKey: ['related-equipment-product', equipment.type, equipment.brand, equipment.model],
    queryFn: () => fetchRelatedProduct(equipment.type, equipment.brand || undefined, equipment.model || undefined),
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
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">{equipment.type}</h3>
            {(equipment.brand || equipment.model) && (
              <p className="text-sm text-muted-foreground">
                {equipment.brand} {equipment.model}
              </p>
            )}
            {equipment.installed_at && (
              <p className="text-xs text-muted-foreground">
                Installed: {new Date(equipment.installed_at).toLocaleDateString()}
              </p>
            )}
            {equipment.notes && (
              <p className="text-xs text-muted-foreground mt-1">{equipment.notes}</p>
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this {equipment.type} from your aquarium. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(equipment.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
