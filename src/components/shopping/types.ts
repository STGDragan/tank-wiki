
import { Tables } from "@/integrations/supabase/types";

export type Product = Tables<'products'> & {
  affiliate_links?: Array<{
    provider: string;
    link_url: string;
  }>;
  category_info?: {
    id: string;
    name: string;
    slug: string;
  };
  compatibility_tags?: Array<{
    id: string;
    name: string;
    tag_type: string;
  }>;
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
