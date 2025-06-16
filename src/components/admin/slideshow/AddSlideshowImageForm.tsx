
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageCropDialog } from "./ImageCropDialog";
import { ImageUploadField } from "./ImageUploadField";
import { AltTextField } from "./AltTextField";
import { ContextSelectField } from "./ContextSelectField";
import { useSlideshowForm } from "@/hooks/useSlideshowForm";

export function AddSlideshowImageForm() {
  const {
    form,
    imageToCrop,
    setImageToCrop,
    addImageMutation,
    handleFileSelect,
    handleCrop,
    handleSubmit,
  } = useSlideshowForm();

  const selectedFile = form.watch("image_file");
  const selectedContext = form.watch("context");

  return (
    <>
      <ImageCropDialog
        imageToCrop={imageToCrop}
        onCrop={handleCrop}
        onClose={() => setImageToCrop(null)}
        context={selectedContext}
      />
      <Card>
        <CardHeader>
          <CardTitle>Add New Image</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <ContextSelectField
                control={form.control}
                isDisabled={addImageMutation.isPending}
              />
              <ImageUploadField
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                isDisabled={addImageMutation.isPending}
                error={form.formState.errors.image_file?.message}
                context={selectedContext}
              />
              <AltTextField
                control={form.control}
                isDisabled={addImageMutation.isPending}
              />
              <Button type="submit" disabled={addImageMutation.isPending}>
                {addImageMutation.isPending ? "Uploading..." : "Add Image"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
