import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as z from 'zod';

export const addLegalDocSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  document_type: z.string().min(1, 'A slug will be generated from a valid title.'),
});

export const legalDocumentEditorSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

export type AddLegalDocFormValues = z.infer<typeof addLegalDocSchema>;
export type LegalDocumentEditorFormValues = z.infer<typeof legalDocumentEditorSchema>;

interface LegalDocInfo {
  document_type: string;
  title: string;
}

// Hook to fetch all legal document types and titles
export const useLegalDocuments = () => {
  return useQuery<LegalDocInfo[]>({
    queryKey: ['legal_documents'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('legal_documents')
        .select('document_type, title')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

// Hook to fetch a single legal document
export const useLegalDocument = (documentType: string) => {
  return useQuery({
    queryKey: ['legal_document', documentType],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('legal_documents')
        .select('*')
        .eq('document_type', documentType)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!documentType,
  });
};

// Hook to create or update a legal document
export const useUpsertLegalDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { document_type: string, title: string, content?: string }) => {
            const { data, error } = await (supabase as any)
                .from('legal_documents')
                .upsert(values, { onConflict: 'document_type' })
                .select()
                .single();

            if (error) {
                 if (error.code === '23505') {
                    throw new Error('A document with this slug already exists.');
                }
                throw error;
            }
            return data;
        },
        onSuccess: (_data, variables) => {
            toast.success("Document saved successfully.");
            queryClient.invalidateQueries({ queryKey: ['legal_documents'] });
            queryClient.invalidateQueries({ queryKey: ['legal_document', variables.document_type] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'An unknown error occurred.');
        }
    });
};
