// pages/api/admin/dashboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Types
interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  lowInventoryProducts: Array<{
    id: string;
    name: string;
    inventory_count: number;
    brand_name: string;
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    created_at: string;
    user_id: string;
  }>;
}

// Use service key for admin operations
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
  res: NextApiResponse<DashboardMetrics | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // TODO: Add admin authentication check here
  // For now, allowing access for development

  try {
    console.log("📊 Fetching admin dashboard metrics...");

    // Fetch all metrics in parallel
    const [
      revenueResult,
      ordersResult,
      lowInventoryResult,
      recentOrdersResult,
    ] = await Promise.all([
      // Total revenue from paid orders
      supabase.from("orders").select("total").eq("status", "paid"),

      // Total order count
      supabase.from("orders").select("id", { count: "exact" }),

      // Low inventory products (less than 10 items)
      supabase
        .from("products")
        .select(
          `
          id,
          name,
          inventory_count,
          brands (
            name
          )
        `
        )
        .lt("inventory_count", 10)
        .order("inventory_count", { ascending: true }),

      // Recent orders (last 10)
      supabase
        .from("orders")
        .select("id, total, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Handle errors
    if (revenueResult.error) {
      console.error("❌ Revenue query error:", revenueResult.error);
      throw new Error("Failed to fetch revenue data");
    }

    if (ordersResult.error) {
      console.error("❌ Orders query error:", ordersResult.error);
      throw new Error("Failed to fetch orders data");
    }

    if (lowInventoryResult.error) {
      console.error("❌ Low inventory query error:", lowInventoryResult.error);
      throw new Error("Failed to fetch inventory data");
    }

    if (recentOrdersResult.error) {
      console.error("❌ Recent orders query error:", recentOrdersResult.error);
      throw new Error("Failed to fetch recent orders");
    }

    // Calculate total revenue
    const totalRevenue = (revenueResult.data || []).reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    // Get total orders count
    const totalOrders = ordersResult.count || 0;

    // Format low inventory products
    const lowInventoryProducts = (lowInventoryResult.data || []).map(
      (product: any) => ({
        id: product.id,
        name: product.name,
        inventory_count: product.inventory_count,
        brand_name: product.brands?.name || "Unknown Brand",
      })
    );

    // Format recent orders
    const recentOrders = (recentOrdersResult.data || []).map((order: any) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
      user_id: order.user_id,
    }));

    const metrics: DashboardMetrics = {
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
      totalOrders,
      lowInventoryProducts,
      recentOrders,
    };

    console.log("✅ Dashboard metrics calculated:", {
      revenue: totalRevenue,
      orders: totalOrders,
      lowInventory: lowInventoryProducts.length,
      recentOrders: recentOrders.length,
    });

    res.status(200).json(metrics);
  } catch (error: any) {
    console.error("❌ Dashboard API error:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard metrics",
    });
  }
}

// Export types
export type { DashboardMetrics };
