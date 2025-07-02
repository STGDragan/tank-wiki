
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import SanitizeAmazonLinkButton from "./SanitizeAmazonLinkButton";
import MultiCategorySelector from "./MultiCategorySelector";

interface CategoryAssignment {
  categoryId: string;
  categoryName: string;
  subcategory: string;
}

const AddProductDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    model: "",
    regular_price: "",
    sale_price: "",
    is_on_sale: false,
    is_featured: false,
    is_recommended: false,
    stock_quantity: "",
    track_inventory: false,
    low_stock_threshold: "5",
    image_urls: [""],
    amazon_url: "",
  });

  const [categoryAssignments, setCategoryAssignments] = useState<CategoryAssignment[]>([
    { categoryId: "", categoryName: "", subcategory: "" }
  ]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      // Create the product first
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (productError) throw productError;

      // Create category assignments
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

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product Added', description: 'The product has been successfully added.' });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding product', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      brand: "",
      model: "",
      regular_price: "",
      sale_price: "",
      is_on_sale: false,
      is_featured: false,
      is_recommended: false,
      stock_quantity: "",
      track_inventory: false,
      low_stock_threshold: "5",
      image_urls: [""],
      amazon_url: "",
    });
    setCategoryAssignments([{ categoryId: "", categoryName: "", subcategory: "" }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredImageUrls = formData.image_urls.filter(url => url.trim() !== "");
    
    const productData = {
      ...formData,
      regular_price: formData.regular_price ? parseFloat(formData.regular_price) : null,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
      low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 5,
      image_url: filteredImageUrls[0] || null,
      imageurls: filteredImageUrls.length > 0 ? filteredImageUrls : null,
      visible: true, // Always visible when creating
    };

    // Remove image_urls from the final data since we use image_url and imageurls
    delete productData.image_urls;

    addProductMutation.mutate(productData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, ""]
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const updateImageUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.map((url, i) => i === index ? value : url)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your store inventory.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Categories & Subcategories */}
          <MultiCategorySelector
            value={categoryAssignments}
            onChange={setCategoryAssignments}
          />

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regular_price">Regular Price ($)</Label>
              <Input
                id="regular_price"
                type="number"
                step="0.01"
                value={formData.regular_price}
                onChange={(e) => handleInputChange('regular_price', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price ($)</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => handleInputChange('sale_price', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Image URLs</Label>
              <Button type="button" onClick={addImageUrl} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Image
              </Button>
            </div>
            {formData.image_urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                {formData.image_urls.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    size="sm"
                    variant="outline"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amazon_url">Amazon URL</Label>
            <div className="flex gap-2">
              <Input
                id="amazon_url"
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
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) => handleInputChange('low_stock_threshold', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="track_inventory"
                checked={formData.track_inventory}
                onCheckedChange={(checked) => handleInputChange('track_inventory', checked)}
              />
              <Label htmlFor="track_inventory">Track Inventory</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_on_sale"
                checked={formData.is_on_sale}
                onCheckedChange={(checked) => handleInputChange('is_on_sale', checked)}
              />
              <Label htmlFor="is_on_sale">On Sale</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_recommended"
                checked={formData.is_recommended}
                onCheckedChange={(checked) => handleInputChange('is_recommended', checked)}
              />
              <Label htmlFor="is_recommended">Recommended</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProductMutation.isPending}>
              {addProductMutation.isPending ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
