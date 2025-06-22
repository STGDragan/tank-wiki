
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
import { Upload, Package, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AmazonProduct {
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  amazon_url?: string;
  brand?: string;
  category?: string;
  asin?: string;
  quantity?: number;
}

interface FieldMapping {
  [csvColumn: string]: string;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

const INTERNAL_FIELDS = [
  { value: 'name', label: 'Product Name (Required)' },
  { value: 'description', label: 'Description' },
  { value: 'price', label: 'Price' },
  { value: 'image_url', label: 'Image URL' },
  { value: 'amazon_url', label: 'Amazon URL' },
  { value: 'brand', label: 'Brand' },
  { value: 'category', label: 'Category' },
  { value: 'asin', label: 'ASIN' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'ignore', label: 'Ignore Column' },
];

export function AmazonProductImportDialog() {
  const [open, setOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [dataFormat, setDataFormat] = useState<"json" | "csv">("json");
  const [defaultCategory, setDefaultCategory] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [sanitizeUrls, setSanitizeUrls] = useState(true);
  const queryClient = useQueryClient();

  // Amazon URL sanitization function
  const sanitizeAmazonUrl = (url: string): string => {
    if (!url || !url.toLowerCase().includes('amazon.')) {
      return url;
    }

    // Extract ASIN from various Amazon URL formats
    let asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
    if (!asinMatch) asinMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (!asinMatch) asinMatch = url.match(/\/product\/([A-Z0-9]{10})/i);
    if (!asinMatch) asinMatch = url.match(/[?&]pd_rd_i=([A-Z0-9]{10})/i);
    if (!asinMatch) asinMatch = url.match(/[?&]ASIN=([A-Z0-9]{10})/i);

    if (asinMatch) {
      return `https://www.amazon.com/dp/${asinMatch[1]}?tag=travisdraga07-20`;
    }

    return url; // Return original URL if no ASIN found
  };

  const importProductsMutation = useMutation({
    mutationFn: async ({ products, category }: { products: AmazonProduct[]; category: string }) => {
      const productsToInsert = products.map(product => ({
        name: product.name,
        description: product.description || "",
        regular_price: product.price || 0,
        category: product.category || category || "Amazon Import",
        subcategory: product.brand || "Imported",
        image_url: product.image_url || null,
        amazon_url: sanitizeUrls && product.amazon_url ? sanitizeAmazonUrl(product.amazon_url) : product.amazon_url || null,
        stock_quantity: product.quantity || 0,
        sku: product.asin || null,
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
        description: `${count} products have been imported from Amazon data.${sanitizeUrls ? ' URLs have been sanitized and tagged.' : ''}`
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleReset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error importing products",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateProduct = (product: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    console.log(`Validating product at row ${rowIndex + 1}:`, product);
    
    if (!product.name || product.name.trim() === '') {
      errors.push({
        row: rowIndex + 1,
        field: 'name',
        value: product.name || '',
        message: 'Product name is required'
      });
    }
    
    if (product.price && isNaN(parseFloat(product.price))) {
      errors.push({
        row: rowIndex + 1,
        field: 'price',
        value: product.price,
        message: 'Price must be a valid number'
      });
    }
    
    if (product.quantity && isNaN(parseInt(product.quantity))) {
      errors.push({
        row: rowIndex + 1,
        field: 'quantity',
        value: product.quantity,
        message: 'Quantity must be a valid number'
      });
    }
    
    if (product.image_url && !isValidUrl(product.image_url)) {
      errors.push({
        row: rowIndex + 1,
        field: 'image_url',
        value: product.image_url,
        message: 'Image URL must be a valid URL'
      });
    }
    
    if (product.amazon_url && !isValidUrl(product.amazon_url)) {
      errors.push({
        row: rowIndex + 1,
        field: 'amazon_url',
        value: product.amazon_url,
        message: 'Amazon URL must be a valid URL'
      });
    }
    
    return errors;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const parseCSVWithMapping = (csvText: string, mapping: FieldMapping): { products: AmazonProduct[], errors: ValidationError[] } => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { products: [], errors: [] };
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const products: AmazonProduct[] = [];
    const allErrors: ValidationError[] = [];
    
    console.log('CSV Headers:', headers);
    console.log('Field Mapping:', mapping);
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const product: any = {};
      
      console.log(`Processing row ${i}, values:`, values);
      
      // Apply field mapping
      headers.forEach((header, index) => {
        const mappedField = mapping[header];
        const value = values[index] || '';
        
        console.log(`Mapping: ${header} (${mappedField}) = "${value}"`);
        
        if (mappedField && mappedField !== 'ignore' && value) {
          switch (mappedField) {
            case 'name':
            case 'description':
            case 'image_url':
            case 'brand':
            case 'category':
            case 'asin':
              product[mappedField] = value;
              break;
            case 'amazon_url':
              product.amazon_url = sanitizeUrls ? sanitizeAmazonUrl(value) : value;
              break;
            case 'price':
              product.price = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
              break;
            case 'quantity':
              product.quantity = parseInt(value) || 0;
              break;
          }
        }
      });
      
      console.log(`Processed product for row ${i}:`, product);
      
      const errors = validateProduct(product, i - 1);
      allErrors.push(...errors);
      
      // Only add products that have a name (after validation)
      if (product.name && product.name.trim() !== '') {
        products.push(product);
      }
    }
    
    console.log('Final products:', products);
    console.log('All errors:', allErrors);
    
    return { products, errors: allErrors };
  };

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
            product.amazon_url = sanitizeUrls ? sanitizeAmazonUrl(value) : value;
            break;
          case 'brand':
            product.brand = value;
            break;
          case 'category':
            product.category = value;
            break;
          case 'asin':
            product.asin = value;
            break;
          case 'quantity':
            product.quantity = parseInt(value) || 0;
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
            amazon_url: sanitizeUrls && (item.url || item.amazon_url) ? 
              sanitizeAmazonUrl(item.url || item.amazon_url) : 
              item.url || item.amazon_url || '',
            brand: item.brand || '',
            category: item.category || '',
            asin: item.asin || '',
            quantity: parseInt(item.quantity) || 0,
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

  const handleDataChange = (value: string) => {
    setImportData(value);
    setValidationErrors([]);
    
    if (dataFormat === "csv" && value.trim()) {
      const lines = value.trim().split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        setCsvHeaders(headers);
        
        // Enhanced auto-mapping with specific mappings for Price and Product Link
        const autoMapping: FieldMapping = {};
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          
          // Specific mappings requested by user
          if (header === 'Price' || lowerHeader === 'price') {
            autoMapping[header] = 'price';
          } else if (header === 'Product Link' || lowerHeader === 'product link') {
            autoMapping[header] = 'amazon_url';
          }
          // General auto-mapping logic
          else if (lowerHeader.includes('name') || lowerHeader.includes('title')) {
            autoMapping[header] = 'name';
          } else if (lowerHeader.includes('description')) {
            autoMapping[header] = 'description';
          } else if (lowerHeader.includes('brand')) {
            autoMapping[header] = 'brand';
          } else if (lowerHeader.includes('category')) {
            autoMapping[header] = 'category';
          } else if (lowerHeader.includes('image')) {
            autoMapping[header] = 'image_url';
          } else if (lowerHeader.includes('url') || lowerHeader.includes('link')) {
            autoMapping[header] = 'amazon_url';
          } else if (lowerHeader.includes('asin')) {
            autoMapping[header] = 'asin';
          } else if (lowerHeader.includes('quantity')) {
            autoMapping[header] = 'quantity';
          } else {
            autoMapping[header] = 'ignore';
          }
        });
        
        console.log('Auto-generated mapping:', autoMapping);
        setFieldMapping(autoMapping);
        setShowMapping(true);
      }
    } else {
      setShowMapping(false);
      setCsvHeaders([]);
      setFieldMapping({});
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
      let errors: ValidationError[] = [];
      
      if (dataFormat === "csv") {
        if (showMapping) {
          console.log('Using field mapping for import:', fieldMapping);
          const result = parseCSVWithMapping(importData, fieldMapping);
          products = result.products;
          errors = result.errors;
        } else {
          products = parseCSV(importData);
        }
      } else {
        products = parseJSON(importData);
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        toast({
          title: "Validation errors found",
          description: `Found ${errors.length} validation errors. Please review and fix them.`,
          variant: "destructive",
        });
        return;
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

  const handleReset = () => {
    setOpen(false);
    setImportData("");
    setDefaultCategory("");
    setCsvHeaders([]);
    setFieldMapping({});
    setValidationErrors([]);
    setShowMapping(false);
    setSanitizeUrls(true);
  };

  const updateFieldMapping = (csvColumn: string, internalField: string) => {
    console.log(`Updating field mapping: ${csvColumn} -> ${internalField}`);
    setFieldMapping(prev => {
      const updated = { ...prev, [csvColumn]: internalField };
      console.log('Updated field mapping state:', updated);
      return updated;
    });
  };

  const handleBulkSanitize = () => {
    if (!importData.trim()) return;
    
    try {
      const lines = importData.trim().split('\n');
      const sanitizedLines = lines.map((line, index) => {
        if (index === 0) return line; // Keep header unchanged
        
        const values = line.split(',');
        const sanitizedValues = values.map(value => {
          const cleanValue = value.trim().replace(/^"|"$/g, '');
          if (cleanValue.toLowerCase().includes('amazon.') && cleanValue.includes('http')) {
            return `"${sanitizeAmazonUrl(cleanValue)}"`;
          }
          return value;
        });
        
        return sanitizedValues.join(',');
      });
      
      setImportData(sanitizedLines.join('\n'));
      toast({
        title: "URLs sanitized",
        description: "All Amazon URLs in your data have been cleaned and tagged.",
      });
    } catch (error) {
      toast({
        title: "Error sanitizing URLs",
        description: "Could not process the data for URL sanitization.",
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sanitize-urls"
                checked={sanitizeUrls}
                onChange={(e) => setSanitizeUrls(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="sanitize-urls" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Auto-sanitize Amazon URLs
              </Label>
            </div>
            
            {dataFormat === "csv" && importData.trim() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBulkSanitize}
                className="flex items-center gap-1"
              >
                <Sparkles className="h-4 w-4" />
                Sanitize All URLs
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-data">
              Amazon Product Data ({dataFormat.toUpperCase()})
            </Label>
            <Textarea
              id="import-data"
              value={importData}
              onChange={(e) => handleDataChange(e.target.value)}
              placeholder={
                dataFormat === "json" 
                  ? `[{"name": "Product Name", "price": "29.99", "description": "Product description", "image_url": "...", "amazon_url": "...", "brand": "Brand Name", "asin": "B123456789", "quantity": 10}]`
                  : `name,price,description,image_url,amazon_url,brand,asin,quantity\n"Product Name","29.99","Product description","...","...","Brand Name","B123456789","10"`
              }
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          {showMapping && csvHeaders.length > 0 && (
            <div className="space-y-3">
              <Label>Field Mapping</Label>
              <div className="border rounded-lg p-4 space-y-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Map your CSV columns to the correct product fields. The left side shows your CSV column headers, the right side lets you choose what type of data each column contains.
                </p>
                {csvHeaders.map((header) => (
                  <div key={header} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        CSV Column: <span className="font-mono bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded text-xs">{header}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Current mapping: <span className="font-medium">{fieldMapping[header] || 'None'}</span>
                      </div>
                    </div>
                    <div className="w-56">
                      <Select 
                        value={fieldMapping[header] || 'ignore'} 
                        onValueChange={(value) => {
                          console.log(`Field mapping change: ${header} -> ${value}`);
                          updateFieldMapping(header, value);
                        }}
                      >
                        <SelectTrigger className="h-10 bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500">
                          <SelectValue placeholder="Select field type..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-lg max-h-[300px] overflow-y-auto z-[100]">
                          {INTERNAL_FIELDS.map((field) => (
                            <SelectItem 
                              key={field.value} 
                              value={field.value} 
                              className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-2 text-sm"
                            >
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Found {validationErrors.length} validation errors:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {validationErrors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-xs">
                        Row {error.row}, {error.field}: {error.message}
                        {error.value && ` (value: "${error.value}")`}
                      </div>
                    ))}
                    {validationErrors.length > 10 && (
                      <p className="text-xs">... and {validationErrors.length - 10} more errors</p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
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
