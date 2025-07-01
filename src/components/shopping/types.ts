
import { Tables } from "@/integrations/supabase/types";

// Use the actual Supabase table type for products with a simpler approach
export type Product = Tables<'products'> & {
  affiliate_links?: {
    provider: string;
    link_url: string;
  }[];
};

export type Category = Tables<'product_categories_new'>;

export interface FilterState {
  categories: string[];
  subcategories: string[];
  priceRange: [number, number];
  tags: string[];
  condition: string[];
  tankTypes: string[];
  sizeClass: string[];
  temperament: string[];
  difficultyLevel: string[];
  compatibilityTags: string[];
}
