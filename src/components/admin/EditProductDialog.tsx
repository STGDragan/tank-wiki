import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import SanitizeAmazonLinkButton from "./SanitizeAmazonLinkButton";

interface EditProductDialogProps {
  product: Tables<'products'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    model: "",
    sku: "",
    regular_price: "",
    sale_price: "",
    is_on_sale: false,
    is_featured: false,
    is_recommended: false,
    stock_quantity: "",
    track_inventory: true,
    low_stock_threshold: "",
    condition: "new",
    image_url: "",
    amazon_url: "",
    visible: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        brand: product.brand || "",
        model: product.model || "",
        sku: product.sku || "",
        regular_price: product.regular_price?.toString() || "",
        sale_price: product.sale_price?.toString() || "",
        is_on_sale: product.is_on_sale || false,
        is_featured: product.is_featured || false,
        is_recommended: product.is_recommended || false,
        stock_quantity: product.stock_quantity?.toString() || "",
        track_inventory: product.track_inventory ?? true,
        low_stock_threshold: product.low_stock_threshold?.toString() || "",
        condition: product.condition || "new",
        image_url: product.image_url || "",
        amazon_url: (product as any).amazon_url || "",
        visible: product.visible ?? true,
      });
    }
  }, [product]);

  const updateProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      if (!product) throw new Error('No product selected');
      
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product Updated', description: 'The product has been successfully updated.' });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      regular_price: formData.regular_price ? parseFloat(formData.regular_price) : null,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
      low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 5,
    };

    updateProductMutation.mutate(productData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name*</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Brand</Label>
              <Input
                id="edit-brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aquarium Equipment">Aquarium Equipment</SelectItem>
                  <SelectItem value="Fish Food">Fish Food</SelectItem>
                  <SelectItem value="Water Treatment">Water Treatment</SelectItem>
                  <SelectItem value="Lighting">Lighting</SelectItem>
                  <SelectItem value="Filtration">Filtration</SelectItem>
                  <SelectItem value="Decoration">Decoration</SelectItem>
                  <SelectItem value="Testing Kits">Testing Kits</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-subcategory">Subcategory</Label>
              <Input
                id="edit-subcategory"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU</Label>
              <Input
                id="edit-sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
              <Input
                id="edit-model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-regular_price">Regular Price ($)</Label>
              <Input
                id="edit-regular_price"
                type="number"
                step="0.01"
                value={formData.regular_price}
                onChange={(e) => handleInputChange('regular_price', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-sale_price">Sale Price ($)</Label>
              <Input
                id="edit-sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => handleInputChange('sale_price', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image_url">Image URL</Label>
            <Input
              id="edit-image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-amazon_url">Amazon URL</Label>
            <div className="flex gap-2">
              <Input
                id="edit-amazon_url"
                type="url"
                value={formData.amazon_url}
                onChange={(e) => handleInputChange('amazon_url', e.target.value)}
                placeholder="https://amazon.com/dp/ASIN123456"
                className="flex-1"
              />
              <SanitizeAmazonLinkButton
                url={formData.amazon_url}
                onUrlChange={(cleanedUrl) => handleInputChange('amazon_url', cleanedUrl)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter any Amazon product URL. Use the sanitize button to clean it and add your affiliate tag.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stock_quantity">Stock Quantity</Label>
              <Input
                id="edit-stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-low_stock_threshold">Low Stock Threshold</Label>
              <Input
                id="edit-low_stock_threshold"
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) => handleInputChange('low_stock_threshold', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-track_inventory"
                checked={formData.track_inventory}
                onCheckedChange={(checked) => handleInputChange('track_inventory', checked)}
              />
              <Label htmlFor="edit-track_inventory">Track Inventory</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_on_sale"
                checked={formData.is_on_sale}
                onCheckedChange={(checked) => handleInputChange('is_on_sale', checked)}
              />
              <Label htmlFor="edit-is_on_sale">On Sale</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
              />
              <Label htmlFor="edit-is_featured">Featured</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_recommended"
                checked={formData.is_recommended}
                onCheckedChange={(checked) => handleInputChange('is_recommended', checked)}
              />
              <Label htmlFor="edit-is_recommended">Recommended</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-visible"
                checked={formData.visible}
                onCheckedChange={(checked) => handleInputChange('visible', checked)}
              />
              <Label htmlFor="edit-visible">Visible</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
