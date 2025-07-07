// pages/api/products.ts - Fixed to use service key like webhook
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Types for better TypeScript support
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  brand_id: string;
  inventory_count: number;
  images: string[] | null;
  created_at: string;
  // Join with brands table
  brands?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 🔥 FIXED: Use the same service key that works in your webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!, // Using service key instead of anon key
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
  res: NextApiResponse<ProductsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract query parameters
    const {
      brand, // Filter by brand slug (e.g., 'liquidheaven')
      search, // Search term for product name
      page = "1", // Page number for pagination
      limit = "20", // Items per page
      sort = "created_at", // Sort field
      order = "desc", // Sort order (asc/desc)
    } = req.query;

    // Convert to numbers with validation
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    console.log(
      `📋 Fetching products - Page: ${pageNum}, Limit: ${limitNum}, Brand: ${
        brand || "all"
      }`
    );

    // 🔧 FIXED: Get brand_id first if brand filter is specified
    let brandId: string | null = null;
    if (brand && typeof brand === "string" && brand !== "all") {
      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .select("id")
        .eq("slug", brand)
        .single();

      if (brandError) {
        console.error("❌ Brand lookup error:", brandError.message);
        return res.status(400).json({ error: `Brand '${brand}' not found` });
      }

      brandId = brandData.id;
      console.log(`🏷️ Found brand ID: ${brandId} for slug: ${brand}`);
    }

    // Build the query
    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        brand_id,
        inventory_count,
        images,
        created_at,
        brands (
          id,
          name,
          slug
        )
      `
      )
      .gt("inventory_count", 0); // Only show products in stock

    // 🔧 FIXED: Apply brand filter using brand_id
    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    // Apply search filter if specified
    if (search && typeof search === "string") {
      query = query.ilike("name", `%${search}%`);
    }

    // Apply sorting
    const validSortFields = ["name", "price", "created_at"];
    const sortField = validSortFields.includes(sort as string)
      ? (sort as string)
      : "created_at";
    const sortOrder = order === "asc" ? false : true; // true = descending

    query = query.order(sortField, { ascending: !sortOrder });

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    // Execute the query
    const { data: products, error, count } = await query;

    if (error) {
      console.error("❌ Database error:", error.message);
      return res.status(500).json({
        error: "Failed to fetch products",
      });
    }

    // 🔧 FIXED: Get total count with same filters applied
    let countQuery = supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gt("inventory_count", 0);

    // Apply same brand filter to count query
    if (brandId) {
      countQuery = countQuery.eq("brand_id", brandId);
    }

    // Apply same search filter to count query
    if (search && typeof search === "string") {
      countQuery = countQuery.ilike("name", `%${search}%`);
    }

    const { count: totalCount } = await countQuery;

    const total = totalCount || 0;
    const hasMore = offset + limitNum < total;

    console.log(`✅ Found ${products?.length || 0} products (${total} total)`);

    // Return formatted response
    const response: ProductsResponse = {
      products: products || [],
      total,
      page: pageNum,
      limit: limitNum,
      hasMore,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("❌ Products API error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Export types for frontend use
export type { Product, ProductsResponse };
