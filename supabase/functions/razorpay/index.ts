// Supabase Edge Function: secure Razorpay order creation + signature verification.
//
// Deploy:
//   supabase functions deploy razorpay --no-verify-jwt
//   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx RAZORPAY_KEY_SECRET=xxx
//
// Then in the frontend .env.local:
//   VITE_RAZORPAY_KEY_ID=rzp_live_xxx
//   VITE_PAYMENTS_API_URL=https://<project-ref>.functions.supabase.co/razorpay
//
// The Key SECRET stays here on the server and is NEVER shipped to the browser.
// This same contract (POST /create-order, POST /verify) can later be served by
// a MERN/Express backend instead — the frontend won't change.

import { createHmac } from "node:crypto";

const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const { pathname } = new URL(req.url);

  try {
    // POST /create-order  { amount, currency, receipt }
    if (pathname.endsWith("/create-order")) {
      const { amount, currency = "INR", receipt } = await req.json();
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${KEY_ID}:${KEY_SECRET}`),
        },
        body: JSON.stringify({ amount, currency, receipt }),
      });
      if (!res.ok) return json({ error: "razorpay_order_failed" }, 502);
      const order = await res.json();
      return json({ orderId: order.id, amount: order.amount, currency: order.currency });
    }

    // POST /verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    if (pathname.endsWith("/verify")) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
      const expected = createHmac("sha256", KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      return json({ verified: expected === razorpay_signature });
    }

    return json({ error: "not_found" }, 404);
  } catch (_err) {
    return json({ error: "bad_request" }, 400);
  }
});
