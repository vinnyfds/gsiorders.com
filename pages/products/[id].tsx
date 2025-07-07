import React from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../src/hooks/useCart';
import ProductCard from '../../src/components/ProductCard';

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart, isLoading } = useCart();

  // TODO: Fetch product by id from API
  const product = {
    id: id as string,
    name: 'Sample Product',
    description: 'Sample description',
    price: 19.99,
    brand_id: 'brand1',
    inventory_count: 10,
    images: [],
    brands: { id: 'brand1', name: 'Sample Brand', slug: 'sample' },
  };

  const handleAddToCart = async () => {
    if (!id) return;
    await addToCart(id as string, 1);
    // TODO: Show toast/feedback
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* TODO: Add loading and error states */}
      <ProductCard product={product} onAddToCart={handleAddToCart} />
      <button
        className="mt-6 w-full bg-brand-primary text-white py-3 rounded-xl hover:bg-brand-accent transition-all disabled:opacity-50"
        onClick={handleAddToCart}
        disabled={isLoading}
        data-testid="add-to-cart-btn"
      >
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductDetailPage; 