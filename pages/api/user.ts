// pages/api/user.ts - Fixed to use service key
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Types
interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  // Add additional profile fields as needed
  full_name?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

interface UserStats {
  total_orders: number;
  total_spent: number;
  cart_items: number;
  wishlist_items: number;
}

interface UserResponse {
  user: UserProfile;
  stats: UserStats;
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
  res: NextApiResponse<
    UserResponse | UserProfile | { error: string; message?: string }
  >
) {
  // For now, using test user ID - replace with real auth session
  // TODO: const { data: { user } } = await supabase.auth.getUser()
  const userId = "123e4567-e89b-12d3-a456-426614174000";

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    switch (req.method) {
      case "GET":
        return await getUserProfile(req, res, userId);

      case "PUT":
        return await updateUserProfile(req, res, userId);

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("❌ User API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/user - Get user profile with stats
async function getUserProfile(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { include_stats = "true" } = req.query;
  const includeStats = include_stats === "true";

  console.log(
    `👤 Fetching user profile: ${userId}, include_stats: ${includeStats}`
  );

  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    console.error("❌ User not found:", userError);
    return res.status(404).json({ error: "User not found" });
  }

  if (!includeStats) {
    return res.status(200).json(user);
  }

  // Fetch user statistics in parallel
  const [ordersResult, cartResult, wishlistResult] = await Promise.all([
    // Total orders and spending
    supabase
      .from("orders")
      .select("total")
      .eq("user_id", userId)
      .eq("status", "paid"),

    // Cart items count
    supabase
      .from("cart_items")
      .select("quantity", { count: "exact" })
      .eq("user_id", userId),

    // Wishlist items count (if you have a wishlist table)
    // For now, we'll return 0 - implement when wishlist is added
    Promise.resolve({ count: 0 }),
  ]);

  // Calculate stats
  const orders = ordersResult.data || [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const cartItems = cartResult.count || 0;
  const wishlistItems = wishlistResult.count || 0;

  const stats: UserStats = {
    total_orders: totalOrders,
    total_spent: Math.round(totalSpent * 100) / 100,
    cart_items: cartItems,
    wishlist_items: wishlistItems,
  };

  console.log(`✅ User profile fetched with stats:`, {
    user_id: userId,
    total_orders: totalOrders,
    total_spent: totalSpent,
    cart_items: cartItems,
  });

  const response: UserResponse = {
    user,
    stats,
  };

  return res.status(200).json(response);
}

// PUT /api/user - Update user profile
async function updateUserProfile(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { email, full_name, phone, address } = req.body;

  console.log(`✏️ Updating user profile: ${userId}`);

  // Validate email format if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  // For now, we only support updating basic fields
  // In a real app, you might have a separate user_profiles table
  const updateData: any = {};

  if (email) updateData.email = email;
  // Add other updateable fields as your schema supports them

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      error: "No valid fields to update",
    });
  }

  const { data: updatedUser, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select("id, email, role, created_at")
    .single();

  if (error) {
    console.error("❌ Error updating user:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update profile",
    });
  }

  console.log(`✅ User profile updated: ${userId}`);

  return res.status(200).json(updatedUser);
}

// Export types
export type { UserProfile, UserStats, UserResponse };
