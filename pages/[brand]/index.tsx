// pages/[brand]/index.tsx - Dynamic Brand Pages with SSR
import React, { useState } from "react";
import { GetServerSideProps } from "next";
import ProductCard from "../../src/components/ProductCard";
import { useCart } from "../../src/hooks/useCart";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

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
  brands?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface BrandPageProps {
  brand: Brand | null;
  products: Product[];
  error?: string;
}

// Use service key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export const getServerSideProps: GetServerSideProps<BrandPageProps> = async (context) => {
  const { brand: brandSlug } = context.params!;

  try {
    // Validate brand slug
    if (!brandSlug || typeof brandSlug !== "string") {
      return {
        notFound: true,
      };
    }

    console.log(`📋 Fetching brand data for slug: ${brandSlug}`);

    // Fetch brand configuration
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, name, slug, theme_config")
      .eq("slug", brandSlug)
      .single();

    if (brandError || !brand) {
      console.error("❌ Brand not found:", brandSlug);
      return {
        notFound: true,
      };
    }

    console.log(`✅ Found brand: ${brand.name}`);

    // Fetch products for this brand
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        brand_id,
        inventory_count,
        images,
        brands (
          id,
          name,
          slug
        )
      `)
      .eq("brand_id", brand.id)
      .gt("inventory_count", 0)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("❌ Products fetch error:", productsError.message);
      return {
        props: {
          brand,
          products: [],
          error: "Failed to fetch products",
        },
      };
    }

    // Transform the data to match the Product interface
    const products: Product[] = (productsData || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      brand_id: item.brand_id,
      inventory_count: item.inventory_count,
      images: item.images,
      brands: item.brands ? {
        id: item.brands.id,
        name: item.brands.name,
        slug: item.brands.slug
      } : undefined
    }));

    console.log(`✅ Found ${products.length} products for ${brand.name}`);

    return {
      props: {
        brand,
        products,
      },
    };
  } catch (error) {
    console.error("❌ Server-side error:", error);
    return {
      props: {
        brand: null,
        products: [],
        error: "Internal server error",
      },
    };
  }
};

const BrandPage: React.FC<BrandPageProps> = ({ brand, products, error }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const { cart, addToCart, isLoading: cartLoading } = useCart();

  // Filter products based on search term
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

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

  // Show error state
  if (error || !brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Brand Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The brand you're looking for does not exist.
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
              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[${brandColor}] focus:border-transparent transition-colors`}
            />
          </div>
        </div>

        {/* Products Section */}
          <div>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {brand.name} Products
                </h2>
                <p className="text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}{" "}
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
          {filteredProducts.length === 0 ? (
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
              {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>

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
