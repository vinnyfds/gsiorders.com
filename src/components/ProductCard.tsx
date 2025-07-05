// src/components/ProductCard.tsx
import React from "react";

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

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  const productImage = "https://picsum.photos/400/400?random=" + product.id;
  const brandName = product.brands?.name || "Unknown Brand";
  const isInStock = product.inventory_count > 0;

  return (
    <article className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 group relative cursor-pointer">
      {/* Product Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={productImage}
          alt={product.name}
          className="aspect-square w-full rounded-xl object-cover transition-all duration-300 group-hover:brightness-110"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />

        {/* Stock Status Badge */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}

        {/* Low Stock Badge */}
        {isInStock && product.inventory_count <= 5 && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Only {product.inventory_count} left
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-3">
        {/* Brand Name */}
        <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
          {brandName}
        </p>

        {/* Product Name */}
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>
        )}

        {/* Price and Stock Info */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">
            {product.inventory_count} in stock
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!isInStock}
          className={`w-full mt-4 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
            isInStock
              ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isInStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
