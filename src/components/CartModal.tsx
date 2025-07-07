import React from 'react';
import { useCart } from '../hooks/useCart';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, isLoading, updateQuantity, removeFromCart } = useCart();

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems: cart.items }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        role="dialog"
        aria-labelledby="cart-modal-title"
        className="relative bg-white rounded-t-2xl md:rounded-2xl max-w-2xl mx-auto mt-auto md:mt-20 animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="cart-modal-title" className="text-2xl font-bold text-gray-900">
            Shopping Cart ({cart.itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M7 13L5.4 5M7 13l4.5 0M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <p className="text-gray-500 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  {/* Product Image */}
                  <img
                    src={item.products.images?.[0] || `https://picsum.photos/80/80?random=${item.product_id}`}
                    alt={item.products.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.products.name}</h3>
                    <p className="text-sm text-gray-500">{item.products.brands?.name}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatPrice(item.products.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 text-center font-medium bg-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      disabled={item.quantity >= item.products.inventory_count}
                      aria-label="Increase quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {formatPrice(item.products.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove from cart"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            {/* Cart Summary */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(cart.total)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal; 