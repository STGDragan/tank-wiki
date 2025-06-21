
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WishlistFormData {
  name: string;
  item_type: string;
  category: string;
  subcategory: string;
  priority: number;
  estimated_price: number;
  notes: string;
}

interface EnhancedWishlistFormProps {
  aquariumType?: string | null;
  onSubmit: (data: Omit<WishlistFormData, 'category' | 'subcategory'>) => void;
  isSubmitting?: boolean;
}

const categories = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'fish', label: 'Fish' },
  { value: 'coral', label: 'Coral' },
  { value: 'plant', label: 'Plant' },
  { value: 'invertebrate', label: 'Invertebrate' },
  { value: 'consumable', label: 'Consumable' }
];

const subcategories = {
  equipment: [
    'Filter', 'Heater', 'Light', 'Pump', 'Skimmer', 'Controller', 'Testing Kit'
  ],
  fish: [
    'Freshwater Community', 'Freshwater Aggressive', 'Saltwater Community', 'Saltwater Aggressive'
  ],
  coral: [
    'SPS', 'LPS', 'Soft Coral', 'Mushroom', 'Zoanthid'
  ],
  plant: [
    'Foreground', 'Midground', 'Background', 'Floating', 'Moss'
  ],
  invertebrate: [
    'Cleanup Crew', 'Shrimp', 'Crab', 'Snail', 'Starfish'
  ],
  consumable: [
    'Food', 'Supplements', 'Medications', 'Test Reagents', 'Filter Media'
  ]
};

export function EnhancedWishlistForm({ aquariumType, onSubmit, isSubmitting }: EnhancedWishlistFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const form = useForm<WishlistFormData>({
    defaultValues: {
      name: '',
      item_type: '',
      category: '',
      subcategory: '',
      priority: 3,
      estimated_price: 0,
      notes: ''
    }
  });

  const handleSubmit = (data: WishlistFormData) => {
    const submitData = {
      name: data.name,
      item_type: data.subcategory || data.category,
      priority: data.priority,
      estimated_price: data.estimated_price,
      notes: data.notes
    };
    onSubmit(submitData);
    form.reset();
    setSelectedCategory('');
  };

  const availableSubcategories = selectedCategory ? subcategories[selectedCategory as keyof typeof subcategories] || [] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add to Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                      form.setValue('subcategory', '');
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {availableSubcategories.length > 0 && (
              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubcategories.map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">High</SelectItem>
                        <SelectItem value="2">Medium-High</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="4">Medium-Low</SelectItem>
                        <SelectItem value="5">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Adding..." : "Add to Wishlist"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
