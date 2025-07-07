import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Types
interface UpdateInventoryRequest {
  product_id: string;
  new_inventory_count: number;
}

interface UpdateInventoryResponse {
  success: boolean;
  product_id: string;
  new_count: number;
  message: string;
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
  res: NextApiResponse<UpdateInventoryResponse | ErrorResponse>
) {
  // Only allow PUT method
  if (req.method !== "PUT") {
    return res.status(405).json({ 
      error: "Method not allowed",
      details: "Only PUT method is supported"
    });
  }

  try {
    // TODO: Add admin authentication check here
    // For now, allowing access for development
    // In production, verify admin JWT token and role

    // Validate request body
    const { product_id, new_inventory_count }: UpdateInventoryRequest = req.body;

    // Input validation
    if (!product_id) {
      return res.status(400).json({ 
        error: "Missing required field: product_id" 
      });
    }

    if (typeof new_inventory_count !== "number") {
      return res.status(400).json({ 
        error: "Invalid field: new_inventory_count must be a number" 
      });
    }

    if (new_inventory_count < 0) {
      return res.status(400).json({ 
        error: "Invalid field: new_inventory_count cannot be negative" 
      });
    }

    if (!Number.isInteger(new_inventory_count)) {
      return res.status(400).json({ 
        error: "Invalid field: new_inventory_count must be an integer" 
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(product_id)) {
      return res.status(400).json({ 
        error: "Invalid field: product_id must be a valid UUID" 
      });
    }

    console.log(`📦 Updating inventory for product ${product_id} to ${new_inventory_count}`);

    // First, check if product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, inventory_count")
      .eq("id", product_id)
      .single();

    if (productError) {
      console.error("❌ Product lookup error:", productError);
      if (productError.code === "PGRST116") {
        return res.status(404).json({ 
          error: "Product not found",
          details: `No product exists with ID: ${product_id}`
        });
      }
      throw productError;
    }

    // Update inventory count
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({ inventory_count: new_inventory_count })
      .eq("id", product_id)
      .select("id, name, inventory_count")
      .single();

    if (updateError) {
      console.error("❌ Inventory update error:", updateError);
      throw updateError;
    }

    console.log(`✅ Successfully updated inventory for "${product.name}" from ${product.inventory_count} to ${new_inventory_count}`);

    // Return success response
    res.status(200).json({
      success: true,
      product_id: product_id,
      new_count: new_inventory_count,
      message: `Successfully updated inventory for "${product.name}"`
    });

  } catch (error: any) {
    console.error("❌ Admin inventory API error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: "Failed to update product inventory"
    });
  }
}

// Export types for use in frontend
export type { UpdateInventoryRequest, UpdateInventoryResponse, ErrorResponse }; 