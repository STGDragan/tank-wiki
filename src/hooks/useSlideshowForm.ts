
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useRef } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const formSchema = z.object({
  image_file: z.instanceof(File, { message: "An image file is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .png, .webp, and .gif files are accepted."
    ),
  alt_text: z.string().min(1, { message: "Alt text is required." }),
  context: z.string().min(1, { message: "Context is required." }),
});

export type SlideshowFormData = z.infer<typeof formSchema>;

export function useSlideshowForm() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<{file: File, src: string} | null>(null);

  const form = useForm<SlideshowFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alt_text: "",
      context: "landing-page",
    },
  });

  const addImageMutation = useMutation({
    mutationFn: async (values: SlideshowFormData) => {
      const file = values.image_file;
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
            { 
              image_url: publicUrl, 
              alt_text: values.alt_text, 
              display_order: nextOrder, 
              context: values.context 
            },
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to add image: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop({ file, src: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = (blob: Blob) => {
    const croppedFile = new File([blob], imageToCrop!.file.name, {
      type: blob.type,
      lastModified: Date.now(),
    });
    form.setValue("image_file", croppedFile, { shouldValidate: true });
    setImageToCrop(null);
  };

  const handleSubmit = (values: SlideshowFormData) => {
    console.log("Form values being submitted:", values); // Debug log
    addImageMutation.mutate(values);
  };

  return {
    form,
    fileInputRef,
    imageToCrop,
    setImageToCrop,
    addImageMutation,
    handleFileSelect,
    handleCrop,
    handleSubmit,
  };
}
