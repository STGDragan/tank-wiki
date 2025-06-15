
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { useUpsertLegalDocument, addLegalDocSchema, AddLegalDocFormValues } from '@/hooks/useLegal';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/--+/g, '-');

export const AddLegalDocumentDialog = () => {
  const [open, setOpen] = useState(false);
  const upsertMutation = useUpsertLegalDocument();

  const form = useForm<AddLegalDocFormValues>({
    resolver: zodResolver(addLegalDocSchema),
    defaultValues: {
      title: '',
      document_type: '',
    },
  });
  
  const titleValue = form.watch('title');

  useEffect(() => {
    form.setValue('document_type', slugify(titleValue), { shouldValidate: true });
  }, [titleValue, form]);

  const onSubmit = async (values: AddLegalDocFormValues) => {
    try {
      await upsertMutation.mutateAsync({
        title: values.title,
        document_type: values.document_type,
        content: `# ${values.title}\n\nStart writing your document here.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      // The hook's onError will show a toast.
      console.error("Failed to create document:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Legal Document</DialogTitle>
          <DialogDescription>
            Create a new legal document. The slug will be used in the URL.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Terms of Service" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL-friendly version)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. terms-of-service" readOnly className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                  </FormControl>
                  <FormDescription>
                    This is automatically generated from the title and cannot be changed directly.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? 'Creating...' : 'Create Document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
