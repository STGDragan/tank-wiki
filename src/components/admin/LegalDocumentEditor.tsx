
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { useEffect } from "react";

const legalDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

type LegalDocumentFormValues = z.infer<typeof legalDocumentSchema>;

interface LegalDocumentEditorProps {
  documentType: string;
  documentTitle: string;
}

export const LegalDocumentEditor = ({ documentType, documentTitle }: LegalDocumentEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: document, isLoading } = useQuery({
    queryKey: ['legal_document', documentType],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('legal_documents')
        .select('*')
        .eq('document_type', documentType)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const form = useForm<LegalDocumentFormValues>({
    resolver: zodResolver(legalDocumentSchema),
    defaultValues: {
      title: documentTitle,
      content: "",
    },
  });

  useEffect(() => {
    if (document) {
      form.reset({
        title: document.title,
        content: document.content || "",
      });
    }
  }, [document, form]);

  const upsertMutation = useMutation({
    mutationFn: async (values: LegalDocumentFormValues) => {
      const { error } = await (supabase as any)
        .from('legal_documents')
        .upsert({
          document_type: documentType,
          title: values.title,
          content: values.content
        }, { onConflict: 'document_type' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Document saved successfully." });
      queryClient.invalidateQueries({ queryKey: ['legal_document', documentType] });
      queryClient.invalidateQueries({ queryKey: ['legal_documents'] });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{form.watch('title') || documentTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => upsertMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={15} placeholder="Enter document content here. Supports Markdown." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
