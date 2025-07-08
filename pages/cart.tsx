import React, { useState } from "react";
import { useCart } from "../src/hooks/useCart";
import Cart from "../src/components/Cart";

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

  return (
    <Cart
      items={cart.items || []}
      itemCount={cart.itemCount || 0}
      total={cart.total || 0}
      isLoading={isLoading}
      isCheckingOut={isCheckingOut}
      onUpdateQuantity={handleUpdateQuantity}
      onRemoveItem={handleRemoveItem}
      onClearCart={handleClearCart}
      onCheckout={handleCheckout}
    />
  );
};

export default CartPage;
