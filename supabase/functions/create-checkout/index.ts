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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const requestBody = await req.json();
    const { mode, priceId, successUrl, cancelUrl, verification_request_id, fee_type, tier_type, amount, metadata } = requestBody;
    logStep("Request body parsed", { mode, fee_type, tier_type, amount });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      logStep("No existing Stripe customer found");
    }

    let session;
    if (mode === "subscription") {
      // Create subscription checkout session
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
          verification_request_id: verification_request_id || '',
          fee_type: fee_type || '',
          tier_type: tier_type || '',
          ...metadata,
        },
      });
    } else {
      // Create one-time payment session
      const lineItems = [];
      
      if (priceId) {
        // Use existing price
        lineItems.push({
          price: priceId,
          quantity: 1,
        });
      } else if (amount) {
        // Create dynamic price for verification fees
        lineItems.push({
          price_data: {
            currency: "gbp",
            product_data: { 
              name: fee_type === 'verification' ? `${tier_type} Verification Fee` : "Service Fee"
            },
            unit_amount: Math.round(amount * 100), // Convert to pence
          },
          quantity: 1,
        });
      } else {
        throw new Error("Either priceId or amount must be provided");
      }

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: lineItems,
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
          verification_request_id: verification_request_id || '',
          fee_type: fee_type || '',
          tier_type: tier_type || '',
          ...metadata,
        },
      });
    }

    logStep("Checkout session created", { sessionId: session.id, mode });

    // Create Supabase client using service role key for database updates
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update verification request with payment session info if provided
    if (verification_request_id) {
      await supabaseService
        .from("verification_requests")
        .update({
          payment_reference: session.id,
          payment_status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', verification_request_id);
      logStep("Updated verification request with payment reference");
    }

    // Create order record if it's a payment mode
    if (mode === "payment") {
      await supabaseService.from("orders").insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: amount ? Math.round(amount * 100) : null,
        currency: "gbp",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      logStep("Created order record");
    } else {
      // Create subscriber record for subscription mode
      await supabaseService.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: false, // Will be updated to true when payment succeeds
        subscription_tier: tier_type,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      logStep("Updated subscriber record");
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});