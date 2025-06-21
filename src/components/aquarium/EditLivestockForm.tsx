
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";
import { DateSelector } from "./DateSelector";
import { useState } from "react";
import { Camera } from "lucide-react";

type Livestock = Tables<'livestock'>;

const editLivestockSchema = z.object({
  name: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  added_at: z.date({ required_error: "Date added is required."}),
  notes: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

type EditLivestockFormValues = z.infer<typeof editLivestockSchema>;

interface EditLivestockFormProps {
  livestock: Livestock;
  onSuccess: () => void;
}

export function EditLivestockForm({ livestock, onSuccess }: EditLivestockFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const form = useForm<EditLivestockFormValues>({
    resolver: zodResolver(editLivestockSchema),
    defaultValues: {
      name: livestock.name || "",
      quantity: livestock.quantity,
      added_at: new Date(livestock.added_at),
      notes: livestock.notes || "",
      image_url: livestock.image_url || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: EditLivestockFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to edit livestock.", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("livestock")
      .update({
        name: values.name || null,
        quantity: values.quantity,
        notes: values.notes || null,
        added_at: values.added_at.toISOString(),
        image_url: values.image_url || null,
      })
      .eq('id', livestock.id);

    if (error) {
      toast({ title: "Error updating livestock", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Livestock updated successfully." });
      await queryClient.invalidateQueries({ queryKey: ['livestock', livestock.aquarium_id] });
      onSuccess();
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // For now, we'll use a placeholder URL. In a real implementation,
      // you'd upload to Supabase Storage or another service
      const imageUrl = URL.createObjectURL(file);
      form.setValue('image_url', imageUrl);
      toast({ title: "Image uploaded", description: "Image has been added to your livestock." });
    } catch (error) {
      toast({ title: "Upload failed", description: "Failed to upload image.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Editing: <strong>{livestock.species}</strong>
        </div>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Nemo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="added_at"
          render={({ field }) => (
            <DateSelector
              value={field.value}
              onChange={field.onChange}
              label="Date Added"
            />
          )}
        />

        <div className="space-y-2">
          <FormLabel>Image</FormLabel>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" disabled={uploading}>
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          {form.watch('image_url') && (
            <img 
              src={form.watch('image_url')} 
              alt="Preview" 
              className="w-20 h-20 object-cover rounded-md"
            />
          )}
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any extra details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Updating..." : "Update Livestock"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
