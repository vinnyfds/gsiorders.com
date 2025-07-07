// pages/api/orders.ts - Fixed to use service key
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Types
interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    images: string[] | null;
    brands: {
      name: string;
      slug: string;
    } | null;
  } | null;
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
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
    OrdersResponse | Order | { error: string; message?: string }
  >
) {
  // For now, using test user ID - replace with real auth session
  const userId = "123e4567-e89b-12d3-a456-426614174000";

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    switch (req.method) {
      case "GET":
        return await getOrders(req, res, userId);

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("❌ Orders API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/orders - Fetch user's order history
async function getOrders(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const {
    page = "1",
    limit = "10",
    status,
    include_items = "false",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
  const offset = (pageNum - 1) * limitNum;
  const includeItems = include_items === "true";

  console.log(
    `📋 Fetching orders for user: ${userId}, page: ${pageNum}, include_items: ${includeItems}`
  );

  // Build base query
  let query = supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total,
      status,
      created_at
      ${
        includeItems
          ? `,
      order_items (
        id,
        order_id,
        product_id,
        quantity,
        price,
        products (
          id,
          name,
          images,
          brands (
            name,
            slug
          )
        )
      )`
          : ""
      }
    `
    )
    .eq("user_id", userId);

  // Filter by status if provided
  if (status && typeof status === "string") {
    query = query.eq("status", status);
  }

  // Apply pagination and sorting
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limitNum - 1);

  const { data: orders, error } = await query;

  if (error) {
    console.error("❌ Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const total = totalCount || 0;

  console.log(`✅ Found ${orders?.length || 0} orders (${total} total)`);

  const response: OrdersResponse = {
    orders: orders || [],
    total,
    page: pageNum,
    limit: limitNum,
  };

  return res.status(200).json(response);
}

// Export types
export type { Order, OrderItem, OrdersResponse };
