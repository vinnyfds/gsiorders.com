import React, { useState } from "react";
import { useCart } from "../src/hooks/useCart";
import Link from "next/link";

const CartPage = () => {
  const { cart, isLoading, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await clearCart();
      } catch (error) {
        console.error("Failed to clear cart:", error);
        alert("Failed to clear cart. Please try again.");
      }
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const handleCheckout = async () => {
    if (!cart.items || cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Prepare cart items for Stripe
      const cartItems = cart.items.map((item) => ({
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity,
      }));

      console.log("Starting checkout with items:", cartItems);

      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItems,
          userId: "123e4567-e89b-12d3-a456-426614174000", // Using test user ID for now
        }),
      });

      const data = await response.json();
      console.log("Checkout response:", data);

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getProductImage = (item: any) => {
    // Always use a reliable placeholder image for now
    // This ensures images always display properly
    const productInitials = item.products.name.substring(0, 2).toUpperCase();
    return `https://picsum.photos/120/120?random=${item.product_id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-xl text-gray-600">
                Loading cart...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Cart</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Start shopping to add items to your cart.
            </p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:mb-0">
            Your Cart
          </h1>
          <button
            onClick={handleClearCart}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Clearing..." : "Clear Cart"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Cart Items ({cart.itemCount} items)
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6">
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
                                    handleUpdateQuantity(
                                      item.product_id,
                                      Math.max(1, item.quantity - 1)
                                    )
                                  }
                                  className="px-3 py-1 hover:bg-gray-100 transition-colors text-lg font-semibold"
                                  disabled={isLoading || item.quantity <= 1}
                                >
                                  −
                                </button>
                                <span className="px-4 py-1 font-medium min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.product_id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="px-3 py-1 hover:bg-gray-100 transition-colors text-lg font-semibold"
                                  disabled={
                                    isLoading ||
                                    item.quantity >=
                                      item.products.inventory_count
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.product_id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                              disabled={isLoading}
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
                              $
                              {(item.products.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${item.products.price.toFixed(2)} ×{" "}
                              {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({cart.itemCount} items)
                  </span>
                  <span className="font-medium">${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">
                    {cart.total >= 50 ? "FREE" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  className="w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cart.items.length === 0}
                >
                  {isCheckingOut ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>
                <Link
                  href="/products"
                  className="w-full bg-gray-100 text-gray-800 text-center py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium block"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  {cart.total >= 50 ? (
                    <span className="text-green-600 font-medium">
                      🎉 You qualify for free shipping!
                    </span>
                  ) : (
                    <span>
                      Add ${(50 - cart.total).toFixed(2)} more for free shipping
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
