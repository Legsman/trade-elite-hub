
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create a Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get request body for subscription details
    const requestData = await req.json();
    const { mode = "subscription", priceId, successUrl, cancelUrl } = requestData;
    
    logStep("Request params", { mode, priceId, successUrl, cancelUrl });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if the user already exists as a Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const success_url = successUrl || `${origin}/settings?checkout_success=true`;
    const cancel_url = cancelUrl || `${origin}/settings?checkout_canceled=true`;

    // Create line items based on mode
    let lineItems;
    
    if (mode === "subscription") {
      // For subscription mode, use a predefined price or the provided priceId
      const defaultPriceId = "price_monthly_premium"; // This would be your actual Stripe price ID
      lineItems = [{
        price: priceId || defaultPriceId,
        quantity: 1,
      }];
    } else {
      // For one-time payment mode
      lineItems = [{
        price_data: {
          currency: "usd",
          product_data: { name: "Premium Authentication" },
          unit_amount: 1999, // $19.99
        },
        quantity: 1,
      }];
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: mode === "subscription" ? "subscription" : "payment",
      success_url,
      cancel_url,
    });

    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    // If this is for a subscription, record it in the database using service role key
    if (mode === "subscription") {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      
      await supabaseAdmin.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
      
      logStep("Updated subscribers table");
    } else {
      // For one-time payments, record in the orders table
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      
      await supabaseAdmin.from("orders").insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: 1999, // Match the amount from line_items
        status: "pending",
      });
      
      logStep("Created order record");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ERROR in create-checkout:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
