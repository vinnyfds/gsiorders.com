// pages/api/cart.ts - Fixed to use service key
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Types
interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined product data
  products: {
    id: string;
    name: string;
    price: number;
    images: string[] | null;
    inventory_count: number;
    brands: {
      name: string;
      slug: string;
    } | null;
  } | null;
}

interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// 🔥 FIXED: Use service key with proper configuration
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CartResponse | { error: string; message?: string }>
) {
  // For now, we'll use the test user ID - in production this comes from auth session
  // TODO: Replace with real auth session: const { data: { user } } = await supabase.auth.getUser()
  const userId = "123e4567-e89b-12d3-a456-426614174000";

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    switch (req.method) {
      case "GET":
        return await getCart(res, userId);

      case "POST":
        return await addToCart(req, res, userId);

      case "PUT":
        return await updateCartItem(req, res, userId);

      case "DELETE":
        return await removeFromCart(req, res, userId);

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("❌ Cart API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/cart - Fetch user's cart
async function getCart(res: NextApiResponse, userId: string) {
  console.log(`📋 Fetching cart for user: ${userId}`);

  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      user_id,
      product_id,
      quantity,
      created_at,
      updated_at,
      products (
        id,
        name,
        price,
        images,
        inventory_count,
        brands (
          name,
          slug
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching cart:", error);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }

  // Calculate totals
  const total =
    cartItems?.reduce((sum, item) => {
      const price = item.products?.price || 0;
      return sum + price * item.quantity;
    }, 0) || 0;

  const itemCount =
    cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  console.log(
    `✅ Cart fetched: ${cartItems?.length} unique items, ${itemCount} total items`
  );

  return res.status(200).json({
    items: cartItems || [],
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    itemCount,
  });
}

// POST /api/cart - Add item to cart
async function addToCart(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({
      error: "Missing required field",
      message: "product_id is required",
    });
  }

  if (quantity < 1 || quantity > 99) {
    return res.status(400).json({
      error: "Invalid quantity",
      message: "Quantity must be between 1 and 99",
    });
  }

  console.log(
    `🛒 Adding to cart: ${product_id} x${quantity} for user: ${userId}`
  );

  // Check if product exists and has inventory
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, inventory_count")
    .eq("id", product_id)
    .single();

  if (productError || !product) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  if (product.inventory_count < quantity) {
    return res.status(400).json({
      error: "Insufficient inventory",
      message: `Only ${product.inventory_count} items available`,
    });
  }

  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", product_id)
    .single();

  if (existingItem) {
    // Update existing item
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.inventory_count) {
      return res.status(400).json({
        error: "Insufficient inventory",
        message: `Cannot add ${quantity} more. Only ${product.inventory_count} items available`,
      });
    }

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingItem.id);

    if (updateError) {
      console.error("❌ Error updating cart item:", updateError);
      return res.status(500).json({ error: "Failed to update cart" });
    }

    console.log(`✅ Updated cart item: ${product_id} quantity: ${newQuantity}`);
  } else {
    // Create new cart item
    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: product_id,
      quantity: quantity,
    });

    if (insertError) {
      console.error("❌ Error adding to cart:", insertError);
      return res.status(500).json({ error: "Failed to add to cart" });
    }

    console.log(`✅ Added new cart item: ${product_id} x${quantity}`);
  }

  // Return updated cart
  return await getCart(res, userId);
}

// PUT /api/cart - Update cart item quantity
async function updateCartItem(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { product_id, quantity } = req.body;

  if (!product_id || quantity === undefined) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "product_id and quantity are required",
    });
  }

  if (quantity < 0 || quantity > 99) {
    return res.status(400).json({
      error: "Invalid quantity",
      message: "Quantity must be between 0 and 99",
    });
  }

  console.log(`📝 Updating cart item: ${product_id} to quantity: ${quantity}`);

  if (quantity === 0) {
    // Remove item if quantity is 0
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", product_id);

    if (error) {
      console.error("❌ Error removing cart item:", error);
      return res.status(500).json({ error: "Failed to remove item" });
    }

    console.log(`✅ Removed cart item: ${product_id}`);
  } else {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("product_id", product_id);

    if (error) {
      console.error("❌ Error updating cart item:", error);
      return res.status(500).json({ error: "Failed to update cart" });
    }

    console.log(`✅ Updated cart item: ${product_id} to quantity: ${quantity}`);
  }

  // Return updated cart
  return await getCart(res, userId);
}

// DELETE /api/cart - Remove item from cart OR clear entire cart
async function removeFromCart(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { product_id } = req.query;

  // If no product_id provided, clear entire cart
  if (!product_id) {
    console.log(`🗑️ Clearing entire cart for user: ${userId}`);

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error clearing cart:", error);
      return res.status(500).json({ error: "Failed to clear cart" });
    }

    console.log(`✅ Cleared entire cart for user: ${userId}`);

    // Return empty cart
    return res.status(200).json({
      items: [],
      total: 0,
      itemCount: 0,
    });
  }

  // Original individual item removal logic
  console.log(`🗑️ Removing from cart: ${product_id} for user: ${userId}`);

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", product_id);

  if (error) {
    console.error("❌ Error removing from cart:", error);
    return res.status(500).json({ error: "Failed to remove from cart" });
  }

  console.log(`✅ Removed from cart: ${product_id}`);

  // Return updated cart
  return await getCart(res, userId);
}
// Export types
export type { CartItem, CartResponse };
