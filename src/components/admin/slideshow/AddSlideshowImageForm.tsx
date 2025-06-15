
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  image_url: z.string().url({ message: "Please enter a valid URL." }),
  alt_text: z.string().min(1, { message: "Alt text is required." }),
});

export function AddSlideshowImageForm() {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image_url: "",
      alt_text: "",
    },
  });

  const addImageMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: maxOrderImage, error: maxOrderError } = await (supabase as any)
          .from('slideshow_images')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1)
          .maybeSingle();

      if (maxOrderError) {
          throw maxOrderError;
      }

      const nextOrder = (maxOrderImage?.display_order ?? -1) + 1;

      const { error } = await (supabase as any).from("slideshow_images").insert([
          { image_url: values.image_url, alt_text: values.alt_text, display_order: nextOrder },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image added successfully!");
      queryClient.invalidateQueries({ queryKey: ["slideshow_images_admin"] });
      queryClient.invalidateQueries({ queryKey: ["slideshow_images"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to add image: ${error.message}`);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addImageMutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Image</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://images.unsplash.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alt_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Text</FormLabel>
                  <FormControl>
                    <Input placeholder="A beautiful coral reef" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={addImageMutation.isPending}>
              {addImageMutation.isPending ? "Adding..." : "Add Image"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
