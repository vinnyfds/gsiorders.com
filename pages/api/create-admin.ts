import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, debug } = req.body;

    // Debug mode - check environment variables
    if (debug) {
      return res.status(200).json({
        debug: true,
        env_check: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? "✅ Set"
            : "❌ Missing",
          SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
            ? "✅ Set"
            : "❌ Missing",
          service_key_length: process.env.SUPABASE_SERVICE_KEY?.length || 0,
          url_value: process.env.NEXT_PUBLIC_SUPABASE_URL,
        },
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
        example: {
          email: "admin@gsiorders.com",
          password: "admin123",
        },
      });
    }

    console.log("🔧 Creating admin user:", email);
    console.log(
      "🔑 Service key length:",
      process.env.SUPABASE_SERVICE_KEY?.length
    );

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

    // Create user with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error("❌ Auth error:", authError);
      return res.status(400).json({
        error: "Failed to create user",
        details: authError.message,
        code: authError.status,
        env_debug: {
          url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key_set: !!process.env.SUPABASE_SERVICE_KEY,
          key_length: process.env.SUPABASE_SERVICE_KEY?.length,
        },
      });
    }

    if (!authData.user) {
      return res.status(400).json({ error: "No user returned" });
    }

    console.log("✅ User created:", authData.user.id);

    // Insert user into users table with admin role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: email,
        role: "admin",
        password_hash: "managed_by_supabase_auth",
      })
      .select()
      .single();

    if (userError) {
      console.error("❌ Database error:", userError);

      if (userError.code === "23505") {
        const { data: updateData, error: updateError } = await supabase
          .from("users")
          .update({ role: "admin" })
          .eq("id", authData.user.id)
          .select()
          .single();

        if (updateError) {
          return res.status(500).json({
            error: "Failed to update user role",
            details: updateError.message,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Admin user updated successfully",
          user: {
            id: authData.user.id,
            email: email,
            role: "admin",
          },
        });
      }

      return res.status(500).json({
        error: "Failed to save user to database",
        details: userError.message,
      });
    }

    console.log("✅ Admin user created successfully");

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: authData.user.id,
        email: email,
        role: "admin",
      },
    });
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
