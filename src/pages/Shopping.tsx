
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
};

const Shopping = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(true);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    priceRange: [0, 1000],
    tags: [],
    condition: []
  });

  // Fetch all products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          affiliate_links (
            link_url,
            provider
          )
        `)
        .eq('visible', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
  });

  // Get unique categories and subcategories
  const { categories, subcategories, maxPrice } = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    const subs = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
    const max = Math.max(...products.map(p => p.regular_price || 0), ...products.map(p => p.sale_price || 0));
    return {
      categories: cats,
      subcategories: subs,
      maxPrice: max || 1000
    };
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

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category || '')) {
        return false;
      }

      // Subcategory filter
      if (filters.subcategories.length > 0 && !filters.subcategories.includes(product.subcategory || '')) {
        return false;
      }

      // Price filter
      const price = product.is_on_sale && product.sale_price ? product.sale_price : product.regular_price;
      if (price && (price < filters.priceRange[0] || price > filters.priceRange[1])) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some(tag => {
          switch (tag) {
            case 'Featured': return product.is_featured;
            case 'On Sale': return product.is_on_sale;
            case 'Recommended': return product.is_recommended;
            default: return false;
          }
        });
        if (!hasTag) return false;
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
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Shopping</h1>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shopping</h1>
      </div>

      {/* Search Bar */}
      <div className="w-full">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {/* Desktop Layout */}
      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block">
          <Sheet open={desktopFilterOpen} onOpenChange={setDesktopFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden mb-4">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-6">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  subcategories={subcategories}
                  maxPrice={maxPrice}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          {desktopFilterOpen && (
            <div className="w-80 sticky top-6">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                subcategories={subcategories}
                maxPrice={maxPrice}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Mobile Filter Button and Sorting Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <MobileFilterDialog
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                subcategories={subcategories}
                maxPrice={maxPrice}
                open={mobileFilterOpen}
                onOpenChange={setMobileFilterOpen}
              />
            </div>
            
            <div className="hidden lg:block">
              <Button
                variant="outline"
                onClick={() => setDesktopFilterOpen(!desktopFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {desktopFilterOpen ? 'Hide' : 'Show'} Filters
              </Button>
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
          {!searchQuery && Object.values(filters).every(f => Array.isArray(f) ? f.length === 0 : f[0] === 0 && f[1] === maxPrice) && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Featured Products</h2>
              <FeaturedProducts />
            </div>
          )}

          {/* All Products Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
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
  );
};

export default Shopping;
