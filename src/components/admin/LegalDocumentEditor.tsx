
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { useEffect } from "react";
import { useLegalDocument, useUpsertLegalDocument, legalDocumentEditorSchema, LegalDocumentEditorFormValues } from "@/hooks/useLegal";

interface LegalDocumentEditorProps {
  documentType: string;
  documentTitle: string;
}

export const LegalDocumentEditor = ({ documentType, documentTitle }: LegalDocumentEditorProps) => {
  const { data: document, isLoading } = useLegalDocument(documentType);
  const upsertMutation = useUpsertLegalDocument();

  const form = useForm<LegalDocumentEditorFormValues>({
    resolver: zodResolver(legalDocumentEditorSchema),
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

  const onSubmit = (data: LegalDocumentEditorFormValues) => {
    upsertMutation.mutate({
      ...data,
      document_type: documentType,
    });
  };

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
