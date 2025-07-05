// pages/[brand]/index.tsx - Dynamic Brand Pages
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProductCard from "../../src/components/ProductCard";
import { useCart } from "../../src/hooks/useCart";
import Link from "next/link";

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

const BrandPage: React.FC = () => {
  const router = useRouter();
  const { brand: brandSlug } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { cart, addToCart, isLoading: cartLoading } = useCart();

  // Brand theme colors
  const getBrandColor = (slug: string) => {
    const colorMap: { [key: string]: string } = {
      liquidheaven: "#4F46E5",
      motaquila: "#059669",
      lastgenie: "#DC2626",
    };
    return colorMap[slug] || "#6366F1";
  };

  const getBrandGradient = (slug: string) => {
    const gradientMap: { [key: string]: string } = {
      liquidheaven: "from-blue-600 to-indigo-700",
      motaquila: "from-green-600 to-emerald-700",
      lastgenie: "from-red-600 to-rose-700",
    };
    return gradientMap[slug] || "from-blue-600 to-indigo-700";
  };

  // Fetch brand info
  const fetchBrand = async (slug: string) => {
    try {
      const response = await fetch("/api/brands");
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      const data = await response.json();
      const foundBrand = data.brands.find((b: Brand) => b.slug === slug);

      if (!foundBrand) {
        throw new Error("Brand not found");
      }

      setBrand(foundBrand);
    } catch (err) {
      console.error("Error fetching brand:", err);
      setError("Brand not found");
    }
  };

  // Fetch products for this brand
  const fetchProducts = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("brand", slug);
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(`/api/products?${params.toString()}`);

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

  // Fetch data when brand slug changes
  useEffect(() => {
    if (brandSlug && typeof brandSlug === "string") {
      fetchBrand(brandSlug);
      fetchProducts(brandSlug);
    }
  }, [brandSlug]);

  // Re-fetch products when search changes
  useEffect(() => {
    if (brandSlug && typeof brandSlug === "string") {
      fetchProducts(brandSlug);
    }
  }, [searchTerm]);

  // Show loading state
  if (loading && !brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading brand...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Brand Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The brand "{brandSlug}" does not exist.
          </p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    );
  }

  const brandColor = getBrandColor(brand.slug);
  const brandGradient = getBrandGradient(brand.slug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Hero Section */}
      <div className={`bg-gradient-to-r ${brandGradient} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">{brand.name}</h1>
            <p className="text-xl opacity-90 mb-8">
              Discover our premium {brand.name.toLowerCase()} collection
            </p>

            {/* Cart Summary */}
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white/90">
                🛒 Cart: {cart.itemCount} items • ${cart.total.toFixed(2)}
                {cartLoading && " (updating...)"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href="/products"
              className="text-gray-500 hover:text-gray-700"
            >
              Products
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-medium" style={{ color: brandColor }}>
              {brand.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search {brand.name} Products
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${brand.name} products...`}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent transition-colors"
              style={{
                focusRingColor: brandColor,
                focusBorderColor: brandColor,
              }}
            />
          </div>
        </div>

        {/* Products Section */}
        {loading ? (
          <div className="text-center py-12">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: brandColor }}
            ></div>
            <p className="mt-2 text-gray-600">
              Loading {brand.name} products...
            </p>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {brand.name} Products
                </h2>
                <p className="text-gray-600">
                  {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                  available
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>

              <div
                className="px-4 py-2 rounded-full text-white font-medium"
                style={{ backgroundColor: brandColor }}
              >
                {brand.name}
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? `No ${brand.name} products match "${searchTerm}"`
                      : `No ${brand.name} products are currently available`}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: brandColor }}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other Brands CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Explore Other Brands
          </h3>
          <Link
            href="/products"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <span>View All Brands</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
