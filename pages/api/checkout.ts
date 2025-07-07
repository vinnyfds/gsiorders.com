// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { cartItems, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${
        req.headers.origin || "http://localhost:3000"
      }/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || "http://localhost:3000"}/cancel`,
      metadata: {
        user_id: userId,
      },
    });

    console.log("✅ Checkout session created:", {
      sessionId: session.id,
      url: session.url,
      metadata: session.metadata,
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
      metadata: session.metadata,
    });
  } catch (error: any) {
    console.error("Checkout session error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
