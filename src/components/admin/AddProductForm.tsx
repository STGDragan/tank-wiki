
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
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Plus className="h-5 w-5 text-primary" />
          Add New Product
        </CardTitle>
        <CardDescription className="font-mono">
          Initialize a new product entry for your inventory system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="cyber-grid grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-display text-primary">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
                className="cyber-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand" className="font-display text-primary">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Brand name"
                className="cyber-input"
              />
            </div>
          </div>

          <div className="cyber-grid grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-display text-primary">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Product category"
                className="cyber-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="font-display text-primary">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                placeholder="Product subcategory"
                className="cyber-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-display text-primary">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Product description"
              rows={3}
              className="cyber-input"
            />
          </div>

          <div className="cyber-grid grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="regular_price" className="font-display text-primary">Regular Price</Label>
              <Input
                id="regular_price"
                type="number"
                step="0.01"
                value={formData.regular_price}
                onChange={(e) => setFormData(prev => ({ ...prev, regular_price: e.target.value }))}
                placeholder="0.00"
                className="cyber-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price" className="font-display text-primary">Sale Price</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                placeholder="0.00"
                className="cyber-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity" className="font-display text-primary">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                placeholder="0"
                className="cyber-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="font-display text-primary">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="cyber-input"
            />
          </div>

          <div className="cyber-grid grid-cols-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="visible"
                checked={formData.visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visible: checked }))}
              />
              <Label htmlFor="visible" className="text-sm font-mono">Visible in Shop</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured" className="text-sm font-mono">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_recommended"
                checked={formData.is_recommended}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recommended: checked }))}
              />
              <Label htmlFor="is_recommended" className="text-sm font-mono">Recommended</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_on_sale"
                checked={formData.is_on_sale}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_on_sale: checked }))}
              />
              <Label htmlFor="is_on_sale" className="text-sm font-mono">On Sale</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={addProductMutation.isPending} className="flex-1 cyber-button">
              <Save className="h-4 w-4 mr-2" />
              {addProductMutation.isPending ? "Initializing..." : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="cyber-button">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
