// pages/api/webhook.ts - Enhanced to handle cart items and create complete orders
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
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
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("🔥 Processing completed checkout:", session.id);

    const userId = session?.metadata?.user_id;

    if (!userId || !isUUID(userId)) {
      console.error("❌ Invalid user_id in metadata:", userId);
      return res.status(400).json({
        error: "Invalid user_id in metadata",
        session_id: session.id,
      });
    }

    try {
      // 1. Get the user's cart items
      console.log("📦 Fetching cart items for user:", userId);
      const { data: cartItems, error: cartError } = await supabaseAdmin
        .from("cart_items")
        .select(
          `
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            inventory_count
          )
        `
        )
        .eq("user_id", userId);

      if (cartError || !cartItems || cartItems.length === 0) {
        console.error("❌ Failed to get cart items:", cartError);
        return res.status(400).json({
          error: "No cart items found",
          session_id: session.id,
        });
      }

      console.log(`📦 Found ${cartItems.length} cart items`);

      // 2. Calculate total from cart items
      const calculatedTotal = cartItems.reduce((sum, item) => {
        return sum + item.products.price * item.quantity;
      }, 0);

      // 3. Create the order
      console.log("💾 Creating order with total:", calculatedTotal);
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: userId,
          total: calculatedTotal,
          status: "paid",
          stripe_session_id: session.id,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        console.error("❌ Failed to create order:", orderError);
        return res.status(500).json({
          error: "Failed to create order",
          session_id: session.id,
        });
      }

      console.log(`✅ Order created: ${orderData.id}`);

      // 4. Create order items
      const orderItemsToInsert = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }));

      const { error: orderItemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItemsToInsert);

      if (orderItemsError) {
        console.error("❌ Failed to create order items:", orderItemsError);
        // Don't return error here, order is already created
      } else {
        console.log(`✅ Created ${orderItemsToInsert.length} order items`);
      }

      // 5. Update inventory (reduce stock)
      for (const item of cartItems) {
        const newInventory = item.products.inventory_count - item.quantity;
        if (newInventory >= 0) {
          await supabaseAdmin
            .from("products")
            .update({ inventory_count: newInventory })
            .eq("id", item.product_id);

          console.log(
            `📦 Updated inventory for ${item.product_id}: ${newInventory}`
          );
        }
      }

      // 6. Clear the user's cart
      const { error: clearCartError } = await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      if (clearCartError) {
        console.error("❌ Failed to clear cart:", clearCartError);
      } else {
        console.log("🧹 Cart cleared successfully");
      }

      // 7. Log successful webhook processing
      await supabaseAdmin.from("webhook_logs").insert({
        event_type: "checkout.session.completed",
        status: "success",
        payload: {
          session_id: session.id,
          order_id: orderData.id,
          user_id: userId,
          total: calculatedTotal,
        },
      });

      console.log("🎉 Webhook processing completed successfully!");

      return res.status(200).json({
        received: true,
        order_id: orderData.id,
        message: "Order created successfully",
      });
    } catch (error: any) {
      console.error("❌ Webhook processing error:", error);

      // Log failed webhook
      await supabaseAdmin.from("webhook_logs").insert({
        event_type: "checkout.session.completed",
        status: "failed",
        payload: {
          session_id: session.id,
          error: error.message,
        },
      });

      return res.status(500).json({
        error: "Webhook processing failed",
        session_id: session.id,
      });
    }
  }

  // Handle other webhook events
  return res.status(200).json({ received: true });
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    str
  );
}
