
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

const addLegalDocSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  document_type: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
});

type AddLegalDocFormValues = z.infer<typeof addLegalDocSchema>;

export const AddLegalDocumentDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: async (values: AddLegalDocFormValues) => {
      const { data, error } = await (supabase as any).from('legal_documents').insert({
        ...values,
        content: `# ${values.title}\n\nStart writing your document here.`
      }).select().single();
      
      if (error) {
        if (error.code === '23505') { // unique constraint violation
            throw new Error('A document with this slug already exists.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'New legal document created.' });
      queryClient.invalidateQueries({ queryKey: ['legal_documents'] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: 'Error', description: error.message });
    },
  });

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
          <form onSubmit={form.handleSubmit(data => createMutation.mutate(data))} className="space-y-4">
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
                    <Input {...field} placeholder="e.g. terms-of-service" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
