import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/shopping/ProductCard";
import FilterSidebar from "@/components/shopping/FilterSidebar";
import MobileFilterDialog from "@/components/shopping/MobileFilterDialog";
import SearchBar from "@/components/shopping/SearchBar";
import SortingControls from "@/components/shopping/SortingControls";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { SponsorshipBanner } from "@/components/sponsorship/SponsorshipBanner";
import { Product, Category, FilterState } from "@/components/shopping/types";
import { Tables } from "@/integrations/supabase/types";

const Shopping = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'popularity' | 'price_low' | 'price_high' | 'newest' | 'name'>("name");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
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
    compatibilityTags: [],
  });

  // Track if initial price has been set
  const [initialPriceSet, setInitialPriceSet] = useState(false);

  // Fetch raw data from Supabase and keep it in the original format for ProductCard
  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          affiliate_links (
            provider,
            link_url
          )
        `)
        .eq('visible', true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Transform raw products to our simplified Product interface for filtering
  const products = useMemo(() => {
    return rawProducts.map((item): Product => ({
      id: item.id,
      name: item.name,
      description: item.description,
      regular_price: item.regular_price,
      sale_price: item.sale_price,
      is_on_sale: item.is_on_sale,
      sale_start_date: item.sale_start_date,
      sale_end_date: item.sale_end_date,
      image_url: item.image_url,
      imageurls: Array.isArray(item.imageurls) ? item.imageurls as string[] : 
                 typeof item.imageurls === 'string' ? [item.imageurls] : null,
      brand: item.brand,
      category: item.category,
      subcategory: item.subcategory,
      subcategories: Array.isArray(item.subcategories) ? item.subcategories as string[] : null,
      condition: item.condition,
      tank_types: Array.isArray(item.tank_types) ? item.tank_types as string[] : null,
      visible: item.visible,
      is_livestock: item.is_livestock,
      size_class: item.size_class,
      temperament: item.temperament,
      difficulty_level: item.difficulty_level,
      max_size: item.max_size,
      min_tank_size: item.min_tank_size,
      track_inventory: item.track_inventory,
      stock_quantity: item.stock_quantity,
      low_stock_threshold: item.low_stock_threshold,
      created_at: item.created_at,
      updated_at: item.updated_at,
      affiliate_links: item.affiliate_links || []
    }));
  }, [rawProducts]);

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories_new")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      // Transform to match our Category interface
      const transformedCategories: Category[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        parent_id: item.parent_id,
        is_active: item.is_active,
        display_order: item.display_order,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return transformedCategories;
    },
  });

  const { data: compatibilityTags = [] } = useQuery({
    queryKey: ["compatibility-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compatibility_tags")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    const prices = products.map(p => p.regular_price || 0).filter(p => p > 0);
    return prices.length > 0 ? Math.max(...prices) : 1000;
  }, [products]);

  // Update initial price range when products load
  useEffect(() => {
    if (!initialPriceSet && maxPrice > 1000) {
      setFilters(prev => ({
        ...prev,
        priceRange: [0, maxPrice]
      }));
      setInitialPriceSet(true);
    }
  }, [maxPrice, initialPriceSet]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());

      // Fix category matching: handle both hierarchical and flat category structures
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.some(slug => {
          const category = categories.find(cat => cat.slug === slug);
          if (!category) return false;
          
          // Check if it matches the product's main category
          if (category.name === product.category) return true;
          
          // Check if it matches the product's subcategory (old flat structure)
          if (category.name === product.subcategory) return true;
          
          // Check if the category matches any item in the product's subcategories array
          if (product.subcategories && Array.isArray(product.subcategories)) {
            const subcategoriesArray = product.subcategories as string[];
            if (subcategoriesArray.includes(category.name)) return true;
          }
          
          // Check if the product's subcategory matches any child of this category
          const categoryChildren = categories.filter(cat => cat.parent_id === category.id);
          return categoryChildren.some(child => child.name === product.subcategory);
        });

      const effectivePrice = product.regular_price || 0;
      const matchesPrice = effectivePrice >= filters.priceRange[0] && 
        effectivePrice <= filters.priceRange[1];

      const matchesBrand = filters.tags.length === 0 || 
        filters.tags.includes(product.brand || '');

      const matchesCondition = filters.condition.length === 0 || 
        filters.condition.includes(product.condition || '');

      const matchesTankTypes = filters.tankTypes.length === 0 ||
        (product.tank_types && Array.isArray(product.tank_types) && 
         filters.tankTypes.some(type => (product.tank_types as string[])?.includes(type)));

      return matchesSearch && matchesCategory && matchesPrice && 
             matchesBrand && matchesCondition && matchesTankTypes;
    });

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "price_low":
          comparison = (a.regular_price || 0) - (b.regular_price || 0);
          break;
        case "price_high":
          comparison = (b.regular_price || 0) - (a.regular_price || 0);
          break;
        case "newest":
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case "name":
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return comparison;
    });

    return filtered;
  }, [products, searchQuery, sortBy, filters, categories]);

  // Create a mapping from filtered products back to raw products for ProductCard
  const filteredRawProducts = useMemo(() => {
    return filteredProducts.map(filteredProduct => 
      rawProducts.find(rawProduct => rawProduct.id === filteredProduct.id)
    ).filter(Boolean) as (Tables<'products'> & { affiliate_links?: Array<{ link_url: string; provider: string; }> })[];
  }, [filteredProducts, rawProducts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <SponsorshipBanner page="shopping" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">Aquarium Products</h1>
            <p className="text-gray-400">
              Discover the best equipment and supplies for your aquarium
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar 
                filters={filters} 
                onFiltersChange={setFilters}
                categories={categories}
                compatibilityTags={compatibilityTags}
                maxPrice={maxPrice}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1 max-w-md">
                  <SearchBar 
                    onSearch={handleSearch}
                  />
                </div>
                
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden"
                  >
                    <Filter size={16} className="mr-2" />
                    Filters
                  </Button>
                  
                  <SortingControls
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    resultCount={filteredProducts.length}
                  />
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 bg-gray-800" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRawProducts.map((product) => (
                    <ProductCard key={product.id} product={product} showBuyNow={true} />
                  ))}
                </div>
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No products found matching your criteria.</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Dialog */}
      <MobileFilterDialog
        open={isMobileFilterOpen}
        onOpenChange={setIsMobileFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        compatibilityTags={compatibilityTags}
        maxPrice={maxPrice}
      />
    </div>
  );
};

export default Shopping;
