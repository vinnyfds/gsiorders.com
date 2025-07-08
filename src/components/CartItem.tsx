import React from 'react';

interface CartItemProps {
  item: {
    id: string;
    product_id: string;
    quantity: number;
    products: {
      name: string;
      price: number;
      inventory_count: number;
      brands?: {
        name: string;
      };
    };
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  isLoading?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isLoading = false,
}) => {
  const getProductImage = (item: any) => {
    // Always use a reliable placeholder image for now
    // This ensures images always display properly
    const productInitials = item.products.name.substring(0, 2).toUpperCase();
    return `https://picsum.photos/120/120?random=${item.product_id}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-start space-x-4">
        {/* Product Image with Error Handling */}
        <div className="flex-shrink-0">
          <img
            src={getProductImage(item)}
            alt={item.products.name}
            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.products.name}
              </h3>
              <p className="text-sm text-blue-600 font-medium mb-2">
                {item.products.brands?.name || "Unknown Brand"}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                ${item.products.price.toFixed(2)} each
                {item.products.inventory_count > 0 && (
                  <span className="ml-2">
                    • {item.products.inventory_count} in stock
                  </span>
                )}
              </p>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-sm text-gray-600">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.product_id,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                    className="px-3 py-1 hover:bg-gray-100 transition-colors text-lg font-semibold"
                    disabled={isLoading || item.quantity <= 1}
                    data-testid="quantity-decrease"
                  >
                    −
                  </button>
                  <span className="px-4 py-1 font-medium min-w-[3rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.product_id,
                        item.quantity + 1
                      )
                    }
                    className="px-3 py-1 hover:bg-gray-100 transition-colors text-lg font-semibold"
                    disabled={
                      isLoading ||
                      item.quantity >= item.products.inventory_count
                    }
                    data-testid="quantity-increase"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(item.product_id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                disabled={isLoading}
                data-testid="remove-item"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove
              </button>
            </div>

            {/* Price */}
            <div className="text-right mt-4 sm:mt-0">
              <div className="text-lg font-bold text-gray-900">
                ${(item.products.price * item.quantity).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                ${item.products.price.toFixed(2)} × {item.quantity}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem; 