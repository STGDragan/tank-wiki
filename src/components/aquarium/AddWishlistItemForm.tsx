
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TablesInsert } from "@/integrations/supabase/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  item_type: z.enum(["Livestock", "Equipment", "Other"]),
  notes: z.string().optional(),
  priority: z.coerce.number().int().min(1).optional().nullable(),
  estimated_price: z.coerce.number().min(0).optional().nullable(),
});

type AddWishlistItemFormValues = z.infer<typeof formSchema>;
type WishlistItemInsert = Omit<TablesInsert<'wishlist_items'>, 'user_id' | 'aquarium_id' | 'id' | 'created_at'>;

interface AddWishlistItemFormProps {
    onSubmit: (values: WishlistItemInsert) => void;
    isSubmitting: boolean;
}

const AddWishlistItemForm = ({ onSubmit, isSubmitting }: AddWishlistItemFormProps) => {
    const form = useForm<AddWishlistItemFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            item_type: "Livestock",
            notes: "",
            priority: undefined,
            estimated_price: undefined,
        },
    });

    const handleFormSubmit = (values: AddWishlistItemFormValues) => {
        onSubmit(values);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Clownfish Pair" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="item_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an item type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Livestock">Livestock</SelectItem>
                                    <SelectItem value="Equipment">Equipment</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 1 (High)" {...field} value={field.value ?? ''} />
                                </FormControl>
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
                                    <Input type="number" placeholder="e.g., 50.00" {...field} value={field.value ?? ''} />
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
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any specific details..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add to Wishlist"}
                </Button>
            </form>
        </Form>
    );
};

export default AddWishlistItemForm;
