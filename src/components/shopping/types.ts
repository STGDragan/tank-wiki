
import { Tables } from "@/integrations/supabase/types";

// Simplified affiliate link type to avoid circular references
export interface AffiliateLink {
  provider: string;
  link_url: string;
}

// Simplified category info type
export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

// Simplified compatibility tag type
export interface CompatibilityTag {
  id: string;
  name: string;
  tag_type: string;
}

// Simplified Product type that avoids deep nesting
export interface Product {
  id: string;
  name: string;
  description: string | null;
  regular_price: number | null;
  sale_price: number | null;
  is_on_sale: boolean | null;
  sale_start_date: string | null;
  sale_end_date: string | null;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  condition: string | null;
  tank_types: string[] | null;
  imageurls: string[] | null;
  image_url: string | null;
  is_visible: boolean | null;
  is_featured: boolean | null;
  is_recommended: boolean | null;
  is_livestock: boolean | null;
  size_class: string | null;
  temperament: string | null;
  difficulty_level: string | null;
  max_size: string | null;
  min_tank_size: string | null;
  track_inventory: boolean | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  created_at: string;
  updated_at: string;
  affiliate_links?: AffiliateLink[];
  category_info?: CategoryInfo;
  compatibility_tags?: CompatibilityTag[];
}

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
