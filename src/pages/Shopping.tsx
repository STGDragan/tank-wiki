import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import SearchBar from "@/components/shopping/SearchBar";
import FilterSidebar, { FilterState } from "@/components/shopping/FilterSidebar";
import ProductCard from "@/components/shopping/ProductCard";
import SortingControls, { SortOption, ViewMode } from "@/components/shopping/SortingControls";
import MobileFilterDialog from "@/components/shopping/MobileFilterDialog";
import FeaturedProducts from "@/components/shopping/FeaturedProducts";
import { Tables } from "@/integrations/supabase/types";

type Product = Tables<'products'> & {
  affiliate_links?: Array<{
    link_url: string;
    provider: string;
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

interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  level: number;
  path: string[];
}

interface CompatibilityTag {
  id: string;
  name: string;
  description: string;
  tag_type: string;
}

const Shopping = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    priceRange: [0, 1000],
    tags: [],
    condition: [],
    tankTypes: [],
    sizeClass: [],
    temperament: [],
    difficultyLevel: [],
    compatibilityTags: []
  });

  // Fetch category hierarchy
  const { data: categories = [] } = useQuery({
    queryKey: ['category-hierarchy'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_category_hierarchy');
      if (error) throw error;
      console.log('Fetched categories:', data);
      return data as CategoryHierarchy[];
    },
  });

  // Fetch compatibility tags
  const { data: compatibilityTags = [] } = useQuery({
    queryKey: ['compatibility-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compatibility_tags')
        .select('*')
        .eq('is_active', true)
        .order('tag_type', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as CompatibilityTag[];
    },
  });

  // Fetch all products with enhanced data
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['enhanced-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          affiliate_links (
            link_url,
            provider
          ),
          category_info:product_categories_new!category_id (
            id,
            name,
            slug
          ),
          product_compatibility_tags (
            compatibility_tags (
              id,
              name,
              tag_type
            )
          )
        `)
        .eq('visible', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to flatten compatibility tags
      return data.map(product => ({
        ...product,
        compatibility_tags: product.product_compatibility_tags?.map(pct => pct.compatibility_tags).filter(Boolean) || []
      })) as Product[];
    },
  });

  // Filter categories to only show those that have products - but keep all equipment categories
  const availableCategories = useMemo(() => {
    console.log('All categories:', categories);
    
    // Always include equipment categories regardless of whether they have products
    const equipmentCategories = categories.filter(cat => 
      cat.slug === 'aquarium-equipment' || 
      (cat.parent_id && categories.find(parent => parent.id === cat.parent_id)?.slug === 'aquarium-equipment')
    );
    
    console.log('Equipment categories:', equipmentCategories);
    
    // For other categories, only show those with products
    const productCategorySlugs = new Set(
      products.map(p => p.category_info?.slug || p.category?.toLowerCase().replace(/\s+/g, '-')).filter(Boolean)
    );
    const productSubcategorySlugs = new Set(
      products.map(p => p.subcategory?.toLowerCase().replace(/\s+/g, '-')).filter(Boolean)
    );
    
    const otherCategories = categories.filter(cat => {
      // Skip equipment categories as we already included them
      if (cat.slug === 'aquarium-equipment') return false;
      if (cat.parent_id && categories.find(parent => parent.id === cat.parent_id)?.slug === 'aquarium-equipment') return false;
      
      if (cat.level === 0) {
        return productCategorySlugs.has(cat.slug);
      } else {
        return productSubcategorySlugs.has(cat.slug);
      }
    });
    
    const result = [...equipmentCategories, ...otherCategories];
    console.log('Available categories:', result);
    return result;
  }, [categories, products]);

  // Calculate maxPrice from products
  const maxPrice = useMemo(() => {
    const prices = products.map(p => {
      const salePrice = p.is_on_sale && p.sale_price ? p.sale_price : null;
      return salePrice || p.regular_price || 0;
    });
    return Math.max(...prices, 1000);
  }, [products]);

  // Update price range when maxPrice changes
  React.useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], Math.min(prev.priceRange[1], maxPrice)]
    }));
  }, [maxPrice]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.subcategory?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter (hierarchical)
      if (filters.categories.length > 0) {
        const productCategorySlug = product.category_info?.slug || product.category?.toLowerCase().replace(/\s+/g, '-');
        if (!productCategorySlug || !filters.categories.includes(productCategorySlug)) {
          return false;
        }
      }

      // Subcategory filter
      if (filters.subcategories.length > 0) {
        const productSubcategorySlug = product.subcategory?.toLowerCase().replace(/\s+/g, '-');
        if (!productSubcategorySlug || !filters.subcategories.includes(productSubcategorySlug)) {
          return false;
        }
      }

      // Price filter
      const price = product.is_on_sale && product.sale_price ? product.sale_price : product.regular_price;
      if (price && (price < filters.priceRange[0] || price > filters.priceRange[1])) {
        return false;
      }

      // Tank types filter
      if (filters.tankTypes.length > 0) {
        if (!product.tank_types || !product.tank_types.some(tt => filters.tankTypes.includes(tt))) {
          return false;
        }
      }

      // Size class filter
      if (filters.sizeClass.length > 0) {
        if (!product.size_class || !filters.sizeClass.includes(product.size_class)) {
          return false;
        }
      }

      // Temperament filter
      if (filters.temperament.length > 0) {
        if (!product.temperament || !filters.temperament.includes(product.temperament)) {
          return false;
        }
      }

      // Difficulty level filter
      if (filters.difficultyLevel.length > 0) {
        if (!product.difficulty_level || !filters.difficultyLevel.includes(product.difficulty_level)) {
          return false;
        }
      }

      // Compatibility tags filter
      if (filters.compatibilityTags.length > 0) {
        const productCompatibilityTagIds = product.compatibility_tags?.map(ct => ct.id) || [];
        if (!filters.compatibilityTags.some(tagId => productCompatibilityTagIds.includes(tagId))) {
          return false;
        }
      }

      // Condition filter
      if (filters.condition.length > 0 && !filters.condition.includes(product.condition || '')) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          const priceA = a.is_on_sale && a.sale_price ? a.sale_price : a.regular_price || 0;
          const priceB = b.is_on_sale && b.sale_price ? b.sale_price : b.regular_price || 0;
          return priceA - priceB;
        case 'price_high':
          const priceA2 = a.is_on_sale && a.sale_price ? a.sale_price : a.regular_price || 0;
          const priceB2 = b.is_on_sale && b.sale_price ? b.sale_price : b.regular_price || 0;
          return priceB2 - priceA2;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'popularity':
        default:
          // Sort by featured, recommended, then created date
          const aScore = (a.is_featured ? 2 : 0) + (a.is_recommended ? 1 : 0);
          const bScore = (b.is_featured ? 2 : 0) + (b.is_recommended ? 1 : 0);
          if (aScore !== bScore) return bScore - aScore;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [products, searchQuery, filters, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Shopping</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isFiltersEmpty = Object.values(filters).every(f => 
    Array.isArray(f) ? f.length === 0 : f[0] === 0 && f[1] === maxPrice
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Shopping</h1>
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        {/* Desktop Layout */}
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar - Always Visible */}
          <div className="hidden lg:block w-80 sticky top-6 h-fit">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              categories={availableCategories}
              compatibilityTags={compatibilityTags}
              maxPrice={maxPrice}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Mobile Filter Button and Sorting Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="lg:hidden">
                <MobileFilterDialog
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={availableCategories}
                  compatibilityTags={compatibilityTags}
                  maxPrice={maxPrice}
                  open={mobileFilterOpen}
                  onOpenChange={setMobileFilterOpen}
                />
              </div>
            </div>

            <SortingControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultCount={filteredAndSortedProducts.length}
            />

            {/* Featured Products Section - Only show if no search/filters active */}
            {!searchQuery && isFiltersEmpty && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Featured Products</h2>
                <FeaturedProducts />
              </div>
            )}

            {/* All Products Grid */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
              </h2>
              
              {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? 'No products found matching your search.' : 'No products available.'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                    : "space-y-4"
                }>
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shopping;
