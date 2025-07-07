// pages/api/brands.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Types
interface Brand {
  id: string;
  name: string;
  slug: string;
  theme_config: object;
}

interface BrandsResponse {
  brands: Brand[];
  total: number;
}

// Use service key for server-side operations
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
  res: NextApiResponse<BrandsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📋 Fetching brands from database...");

    // Fetch all brands from Supabase
    const { data: brands, error } = await supabase
      .from("brands")
      .select("id, name, slug, theme_config")
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ Database error:", error.message);
      return res.status(500).json({
        error: "Failed to fetch brands",
      });
    }

    console.log(`✅ Found ${brands?.length || 0} brands`);

    // Return formatted response
    const response: BrandsResponse = {
      brands: brands || [],
      total: brands?.length || 0,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("❌ Brands API error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Export types for frontend use
export type { Brand, BrandsResponse };
