
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/shopping/ProductCard";
import { FilterSidebar } from "@/components/shopping/FilterSidebar";
import { MobileFilterDialog } from "@/components/shopping/MobileFilterDialog";
import { SearchBar } from "@/components/shopping/SearchBar";
import { SortingControls } from "@/components/shopping/SortingControls";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { SponsorshipBanner } from "@/components/sponsorship/SponsorshipBanner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  subcategory: string;
  brand: string;
  availability: string;
  is_featured: boolean;
  compatibility_tags: string[];
  affiliate_links: Array<{
    provider: string;
    link_url: string;
  }>;
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  brands: string[];
  availability: string[];
  compatibilityTags: string[];
}

const Shopping = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000],
    brands: [],
    availability: [],
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
      return data as Product[];
    },
  });

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(product.category);

      const matchesPrice = product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1];

      const matchesBrand = filters.brands.length === 0 || 
        filters.brands.includes(product.brand || '');

      const matchesAvailability = filters.availability.length === 0 || 
        filters.availability.includes(product.availability || '');

      const matchesCompatibility = filters.compatibilityTags.length === 0 ||
        filters.compatibilityTags.some(tag => 
          product.compatibility_tags?.includes(tag)
        );

      return matchesSearch && matchesCategory && matchesPrice && 
             matchesBrand && matchesAvailability && matchesCompatibility;
    });

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "price":
          comparison = a.price - b.price;
          break;
        case "name":
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [products, searchQuery, sortBy, sortOrder, filters]);

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
                products={products}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1 max-w-md">
                  <SearchBar 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
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
                    sortOrder={sortOrder}
                    onSortChange={setSortBy}
                    onOrderChange={setSortOrder}
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-400">
                {isLoading ? "Loading..." : `${filteredProducts.length} products found`}
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
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        products={products}
      />
    </div>
  );
};

export default Shopping;
