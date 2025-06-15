
import * as z from "zod";

export const articleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    content: z.string().optional(),
    status: z.enum(['draft', 'published']),
    category_id: z.string().uuid().nullable(),
    tags: z.string().optional(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
