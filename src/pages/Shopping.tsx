import { useState, useMemo } from "react";
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

  const { data: products = [], isLoading } = useQuery({
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
        .eq('is_visible', true)
        .order("name");

      if (error) throw error;
      
      // Return the data with proper typing
      return (data || []).map(item => ({
        ...item,
        affiliate_links: item.affiliate_links || []
      })) as Product[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("product_categories_new")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
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
      return data;
    },
  });

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.max(...products.map(p => p.regular_price || 0));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(product.category || '');

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
  }, [products, searchQuery, sortBy, filters]);

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
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
