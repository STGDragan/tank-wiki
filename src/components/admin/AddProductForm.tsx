
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, RotateCcw } from "lucide-react";

export const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    model: "",
    regular_price: "",
    sale_price: "",
    image_url: "",
    visible: true,
    is_featured: false,
    is_recommended: false,
    is_on_sale: false,
    stock_quantity: "0"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const { error } = await supabase.from('products').insert([productData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product Added', description: 'New product has been added successfully.' });
      handleReset();
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding product', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Product name required', description: 'Please enter a product name.', variant: 'destructive' });
      return;
    }

    const productData = {
      ...formData,
      regular_price: formData.regular_price ? parseFloat(formData.regular_price) : null,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: parseInt(formData.stock_quantity) || 0
    };

    addProductMutation.mutate(productData);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      subcategory: "",
      brand: "",
      model: "",
      regular_price: "",
      sale_price: "",
      image_url: "",
      visible: true,
      is_featured: false,
      is_recommended: false,
      is_on_sale: false,
      stock_quantity: "0"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Product
        </CardTitle>
        <CardDescription>
          Create a new product entry for your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Brand name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Product category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                placeholder="Product subcategory"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Product description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regular_price">Regular Price</Label>
              <Input
                id="regular_price"
                type="number"
                step="0.01"
                value={formData.regular_price}
                onChange={(e) => setFormData(prev => ({ ...prev, regular_price: e.target.value }))}
                placeholder="0.00"
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
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="visible"
                checked={formData.visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visible: checked }))}
              />
              <Label htmlFor="visible" className="text-sm">Visible in Shop</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured" className="text-sm">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_recommended"
                checked={formData.is_recommended}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recommended: checked }))}
              />
              <Label htmlFor="is_recommended" className="text-sm">Recommended</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_on_sale"
                checked={formData.is_on_sale}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_on_sale: checked }))}
              />
              <Label htmlFor="is_on_sale" className="text-sm">On Sale</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={addProductMutation.isPending} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {addProductMutation.isPending ? "Adding..." : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
