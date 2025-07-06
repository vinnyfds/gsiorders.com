import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Types
interface ProductWithInventory {
  id: string;
  name: string;
  inventory_count: number;
  price: number;
  brand_id: string;
  brand_name: string;
  created_at: string;
}

interface ProductsResponse {
  products: ProductWithInventory[];
  total_count: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
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
  res: NextApiResponse<ProductsResponse | ErrorResponse>
) {
  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({ 
      error: "Method not allowed",
      details: "Only GET method is supported"
    });
  }

  try {
    // TODO: Add admin authentication check here
    // For now, allowing access for development

    // Query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    console.log(`📦 Fetching products for inventory management (page ${page}, limit ${limit})`);

    // Fetch products with brand information
    const { data: products, error: productsError, count } = await supabase
      .from("products")
      .select(`
        id,
        name,
        inventory_count,
        price,
        brand_id,
        created_at,
        brands (
          name
        )
      `, { count: 'exact' })
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (productsError) {
      console.error("❌ Products query error:", productsError);
      throw productsError;
    }

    // Format response data
    const formattedProducts: ProductWithInventory[] = (products || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      inventory_count: product.inventory_count || 0,
      price: product.price || 0,
      brand_id: product.brand_id,
      brand_name: product.brands?.name || "Unknown Brand",
      created_at: product.created_at,
    }));

    console.log(`✅ Found ${formattedProducts.length} products (${count} total)`);

    res.status(200).json({
      products: formattedProducts,
      total_count: count || 0,
    });

  } catch (error: any) {
    console.error("❌ Admin products API error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: "Failed to fetch products"
    });
  }
}

// Export types for use in frontend
export type { ProductWithInventory, ProductsResponse, ErrorResponse }; 