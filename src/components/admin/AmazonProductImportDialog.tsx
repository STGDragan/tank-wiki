
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, Package } from "lucide-react";

interface AmazonProduct {
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  amazon_url?: string;
  brand?: string;
  category?: string;
}

export function AmazonProductImportDialog() {
  const [open, setOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [dataFormat, setDataFormat] = useState<"json" | "csv">("json");
  const [defaultCategory, setDefaultCategory] = useState("");
  const queryClient = useQueryClient();

  const importProductsMutation = useMutation({
    mutationFn: async ({ products, category }: { products: AmazonProduct[]; category: string }) => {
      const productsToInsert = products.map(product => ({
        name: product.name,
        description: product.description || "",
        regular_price: product.price || 0,
        category: product.category || category || "Amazon Import",
        subcategory: product.brand || "Imported",
        image_url: product.image_url || null,
        amazon_url: product.amazon_url || null,
        is_featured: false,
        is_recommended: false,
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) throw error;
      return productsToInsert.length;
    },
    onSuccess: (count) => {
      toast({ 
        title: "Products imported successfully", 
        description: `${count} products have been imported from Amazon data.`
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
      setImportData("");
      setDefaultCategory("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error importing products",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const parseCSV = (csvText: string): AmazonProduct[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products: AmazonProduct[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const product: AmazonProduct = { name: '' };
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'name':
          case 'title':
          case 'product_name':
            product.name = value;
            break;
          case 'description':
            product.description = value;
            break;
          case 'price':
            product.price = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
            break;
          case 'image':
          case 'image_url':
            product.image_url = value;
            break;
          case 'url':
          case 'amazon_url':
            product.amazon_url = value;
            break;
          case 'brand':
            product.brand = value;
            break;
          case 'category':
            product.category = value;
            break;
        }
      });
      
      if (product.name) {
        products.push(product);
      }
    }
    
    return products;
  };

  const parseJSON = (jsonText: string): AmazonProduct[] => {
    try {
      const data = JSON.parse(jsonText);
      const products: AmazonProduct[] = [];
      
      if (Array.isArray(data)) {
        data.forEach(item => {
          const product: AmazonProduct = {
            name: item.name || item.title || item.product_name || '',
            description: item.description || '',
            price: parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0,
            image_url: item.image || item.image_url || '',
            amazon_url: item.url || item.amazon_url || '',
            brand: item.brand || '',
            category: item.category || '',
          };
          
          if (product.name) {
            products.push(product);
          }
        });
      }
      
      return products;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: "No data provided",
        description: "Please paste your Amazon product data.",
        variant: "destructive",
      });
      return;
    }

    try {
      let products: AmazonProduct[];
      
      if (dataFormat === "csv") {
        products = parseCSV(importData);
      } else {
        products = parseJSON(importData);
      }

      if (products.length === 0) {
        toast({
          title: "No valid products found",
          description: "Please check your data format and try again.",
          variant: "destructive",
        });
        return;
      }

      importProductsMutation.mutate({ products, category: defaultCategory });
    } catch (error) {
      toast({
        title: "Error parsing data",
        description: error instanceof Error ? error.message : "Please check your data format.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import from Amazon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Import Amazon Products
          </DialogTitle>
          <DialogDescription>
            Paste CSV or JSON data from your Amazon scraping tool to import products.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data-format">Data Format</Label>
            <Select value={dataFormat} onValueChange={(value: "json" | "csv") => setDataFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-category">Default Category (optional)</Label>
            <Select value={defaultCategory} onValueChange={setDefaultCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a default category..." />
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
            <Label htmlFor="import-data">
              Amazon Product Data ({dataFormat.toUpperCase()})
            </Label>
            <Textarea
              id="import-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={
                dataFormat === "json" 
                  ? `[{"name": "Product Name", "price": "29.99", "description": "Product description", "image_url": "...", "amazon_url": "...", "brand": "Brand Name"}]`
                  : `name,price,description,image_url,amazon_url,brand\n"Product Name","29.99","Product description","...","...","Brand Name"`
              }
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={importProductsMutation.isPending}
            >
              {importProductsMutation.isPending ? "Importing..." : "Import Products"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
