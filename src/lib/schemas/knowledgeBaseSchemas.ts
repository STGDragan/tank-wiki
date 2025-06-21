
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

export const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  html_content: z.string().optional(),
  content_type: z.enum(["text", "html"]).default("text"),
  tldr: z.string().optional(),
  status: z.enum(["draft", "published"]),
  category_id: z.string().nullable(),
  tags: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
export type ArticleFormData = z.infer<typeof articleSchema>;
