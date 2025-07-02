
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProductImageManager } from "./ProductImageManager";
import { Images, Package } from "lucide-react";
import MultiCategorySelector from "./MultiCategorySelector";

interface CategoryAssignment {
  categoryId: string;
  categoryName: string;
  subcategory: string;
}

interface EditProductDialogProps {
  product: Tables<'products'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const [imageManagerOpen, setImageManagerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    regular_price: '',
    sale_price: '',
    stock_quantity: '',
    condition: 'new',
    is_featured: false,
    is_recommended: false,
    is_on_sale: false,
    track_inventory: true,
    low_stock_threshold: '5'
  });

  const [categoryAssignments, setCategoryAssignments] = useState<CategoryAssignment[]>([
    { categoryId: "", categoryName: "", subcategory: "" }
  ]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing category assignments
  const { data: existingAssignments } = useQuery({
    queryKey: ["product-category-assignments", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const { data, error } = await supabase
        .from("product_category_assignments")
        .select(`
          *,
          product_categories_new!inner(name)
        `)
        .eq("product_id", product.id);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id && open,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        model: product.model || '',
        regular_price: product.regular_price?.toString() || '',
        sale_price: product.sale_price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        condition: product.condition || 'new',
        is_featured: product.is_featured || false,
        is_recommended: product.is_recommended || false,
        is_on_sale: product.is_on_sale || false,
        track_inventory: product.track_inventory ?? true,
        low_stock_threshold: product.low_stock_threshold?.toString() || '5'
      });
    }
  }, [product]);

  useEffect(() => {
    if (existingAssignments && existingAssignments.length > 0) {
      const assignments = existingAssignments.map(assignment => ({
        categoryId: assignment.category_id || '',
        categoryName: assignment.product_categories_new?.name || '',
        subcategory: assignment.subcategory_name || ''
      }));
      setCategoryAssignments(assignments);
    } else if (open) {
      setCategoryAssignments([{ categoryId: "", categoryName: "", subcategory: "" }]);
    }
  }, [existingAssignments, open]);

  const updateProductMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<'products'>>) => {
      if (!product) throw new Error("No product selected");
      
      // Update the product
      const { error: productError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);
      
      if (productError) throw productError;

      // Delete existing category assignments
      const { error: deleteError } = await supabase
        .from('product_category_assignments')
        .delete()
        .eq('product_id', product.id);
      
      if (deleteError) throw deleteError;

      // Create new category assignments
      const validAssignments = categoryAssignments.filter(
        assignment => assignment.categoryId && assignment.categoryName
      );

      if (validAssignments.length > 0) {
        const assignments = validAssignments.map(assignment => ({
          product_id: product.id,
          category_id: assignment.categoryId,
          subcategory_name: assignment.subcategory || null
        }));

        const { error: assignmentError } = await supabase
          .from('product_category_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-category-assignments'] });
      toast({ title: 'Product Updated', description: 'Product has been updated successfully.' });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) {
      toast({ title: 'Error', description: 'No product selected', variant: 'destructive' });
      return;
    }

    const updates: Partial<Tables<'products'>> = {
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      model: formData.model,
      regular_price: formData.regular_price ? parseFloat(formData.regular_price) : null,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
      condition: formData.condition,
      is_featured: formData.is_featured,
      is_recommended: formData.is_recommended,
      is_on_sale: formData.is_on_sale,
      track_inventory: formData.track_inventory,
      low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : null,
    };

    updateProductMutation.mutate(updates);
  };

  if (!product) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Edit Product
            </DialogTitle>
            <DialogDescription>
              Update product information and settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Categories & Subcategories */}
            <MultiCategorySelector
              productId={product.id}
              value={categoryAssignments}
              onChange={setCategoryAssignments}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regular_price">Regular Price</Label>
                <Input
                  id="regular_price"
                  type="number"
                  step="0.01"
                  value={formData.regular_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, regular_price: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_price">Sale Price</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
                <Label htmlFor="is_featured">Featured product</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recommended"
                  checked={formData.is_recommended}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recommended: checked }))}
                />
                <Label htmlFor="is_recommended">Recommended product</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_on_sale"
                  checked={formData.is_on_sale}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_on_sale: checked }))}
                />
                <Label htmlFor="is_on_sale">On sale</Label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setImageManagerOpen(true)}
              >
                <Images className="h-4 w-4 mr-2" />
                Manage Images
              </Button>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProductMutation.isPending}>
                  {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ProductImageManager
        product={product}
        open={imageManagerOpen}
        onOpenChange={setImageManagerOpen}
      />
    </>
  );
};

export default EditProductDialog;
