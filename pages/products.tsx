// pages/products.tsx - Enhanced with Brand Filtering
import React, { useState, useEffect } from "react";
import ProductCard from "../src/components/ProductCard";
import { useCart } from "../src/hooks/useCart";

interface Brand {
  id: string;
  name: string;
  slug: string;
  theme_config: {
    theme: string;
    primaryColor: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  brand_id: string;
  inventory_count: number;
  images: string[] | null;
  brands?: Brand;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { cart, addToCart, isLoading: cartLoading } = useCart();

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedBrand !== "all") {
        params.append("brand", selectedBrand);
      }
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const url = `/api/products${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding to cart
  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      alert("Added to cart successfully!");
    } catch (error) {
      alert("Failed to add to cart. Please try again.");
      console.error("Add to cart error:", error);
    }
  };

  // Get brand theme color
  const getBrandColor = (brandSlug: string) => {
    const colorMap: { [key: string]: string } = {
      liquidheaven: "#4F46E5",
      motaquila: "#059669",
      lastgenie: "#DC2626",
    };
    return colorMap[brandSlug] || "#6366F1";
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedBrand, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>

          {/* Cart Summary */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              🛒 Cart: {cart.itemCount} items • Total: ${cart.total.toFixed(2)}
              {cartLoading && " (updating...)"}
            </p>
          </div>
        </div>
      </div>

      {/* Brand Filter Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBrand("all")}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedBrand === "all"
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Brands
            </button>

            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.slug)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedBrand === brand.slug
                    ? "text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  backgroundColor:
                    selectedBrand === brand.slug
                      ? getBrandColor(brand.slug)
                      : undefined,
                }}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={fetchProducts}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found.</p>
                <p className="text-gray-400">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {products.length} product
                    {products.length !== 1 ? "s" : ""}
                    {selectedBrand !== "all" &&
                      ` for ${
                        brands.find((b) => b.slug === selectedBrand)?.name ||
                        selectedBrand
                      }`}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </p>

                  {/* Quick Brand Stats */}
                  {selectedBrand !== "all" && (
                    <div
                      className="px-3 py-1 rounded-full text-white text-sm font-medium"
                      style={{
                        backgroundColor: getBrandColor(selectedBrand),
                      }}
                    >
                      {brands.find((b) => b.slug === selectedBrand)?.name ||
                        selectedBrand}
                    </div>
                  )}
                </div>

                <div 
                  data-testid="products-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
