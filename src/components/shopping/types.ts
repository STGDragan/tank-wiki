
// Enhanced Product type with new features
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  regular_price?: number | null;
  sale_price?: number | null;
  is_on_sale?: boolean | null;
  sale_start_date?: string | null;
  sale_end_date?: string | null;
  image_url?: string | null;
  images?: string[] | null;
  imageurls?: string[] | null;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
  subcategories?: string[] | null;
  condition?: string | null;
  tank_types?: string[] | null;
  visible?: boolean | null;
  is_livestock?: boolean | null;
  size_class?: string | null;
  temperament?: string | null;
  difficulty_level?: string | null;
  max_size?: string | null;
  min_tank_size?: string | null;
  track_inventory?: boolean | null;
  stock_quantity?: number | null;
  low_stock_threshold?: number | null;
  created_at: string;
  updated_at: string;
  affiliate_links?: {
    provider: string;
    link_url: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  is_active?: boolean | null;
  display_order?: number | null;
  created_at: string;
  updated_at: string;
}

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
