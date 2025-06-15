import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const formSchema = z.object({
  image_file: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, "An image file is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .png, .webp, and .gif files are accepted."
    ),
  alt_text: z.string().min(1, { message: "Alt text is required." }),
  context: z.string().min(1, { message: "Context is required." }),
});

export function AddSlideshowImageForm() {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alt_text: "",
      context: "landing-page",
    },
  });

  const addImageMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const file = values.image_file[0];
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

      const { data: uploadData, error: uploadError } = await (supabase as any).storage
        .from('slideshow_images')
        .upload(fileName, file);
      
      if (uploadError) {
        throw new Error(`Storage error: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = (supabase as any).storage
        .from('slideshow_images')
        .getPublicUrl(uploadData.path);
      
      if (!publicUrl) {
        await (supabase as any).storage.from('slideshow_images').remove([uploadData.path]);
        throw new Error("Could not retrieve public URL for the uploaded image.");
      }
      
      try {
        const { data: maxOrderImage, error: maxOrderError } = await (supabase as any)
            .from('slideshow_images')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (maxOrderError) throw maxOrderError;

        const nextOrder = (maxOrderImage?.display_order ?? -1) + 1;

        const { error: insertError } = await (supabase as any).from("slideshow_images").insert([
            { image_url: publicUrl, alt_text: values.alt_text, display_order: nextOrder, context: values.context },
        ]);
        if (insertError) throw insertError;
      } catch (dbError) {
        await (supabase as any).storage.from('slideshow_images').remove([uploadData.path]);
        throw dbError;
      }
    },
    onSuccess: () => {
      toast.success("Image uploaded successfully!");
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
              name="image_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      ref={field.ref}
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image from your computer (max 5MB).
                  </FormDescription>
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
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a context" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="landing-page">Landing Page</SelectItem>
                      {/* To add more slideshow locations, add a new <SelectItem /> here with a unique value. */}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select where this slideshow will appear.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={addImageMutation.isPending}>
              {addImageMutation.isPending ? "Uploading..." : "Add Image"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
