// src/hooks/useCart.ts
import { useState, useEffect, useCallback } from "react";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    inventory_count: number;
    brands: {
      name: string;
      slug: string;
    };
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface UseCartReturn {
  cart: CartState;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Set empty cart on error
      setCart({
        items: [],
        total: 0,
        itemCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: productId,
            quantity,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add to cart");
        }

        const data = await response.json();
        setCart(data);

        // Show success message (you can customize this)
        console.log("✅ Added to cart successfully");
      } catch (error) {
        console.error("Error adding to cart:", error);
        throw error; // Re-throw so component can handle it
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Remove item from cart
  const removeFromCart = useCallback(async (productId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cart?product_id=${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove from cart");
      }

      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update quantity of item in cart
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: productId,
            quantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update cart");
        }

        const data = await response.json();
        setCart(data);
      } catch (error) {
        console.error("Error updating cart:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [removeFromCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      setCart({
        items: [],
        total: 0,
        itemCount: 0,
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh cart (alias for fetchCart)
  const refreshCart = useCallback(() => {
    return fetchCart();
  }, [fetchCart]);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };
};

export default useCart;
