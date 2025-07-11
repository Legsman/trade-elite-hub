import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
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
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Session ID received", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved Stripe session", { 
      status: session.payment_status, 
      mode: session.mode,
      metadata: session.metadata 
    });

    // Create Supabase client using service role key for database updates
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const verificationRequestId = session.metadata?.verification_request_id;
    const feeType = session.metadata?.fee_type;
    const tierType = session.metadata?.tier_type;

    if (session.payment_status === 'paid') {
      logStep("Payment confirmed as paid");

      // Update verification request if applicable
      if (verificationRequestId) {
        await supabaseService
          .from("verification_requests")
          .update({
            payment_status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', verificationRequestId);
        logStep("Updated verification request payment status to completed");
      }

      // Update orders table for one-time payments
      if (session.mode === 'payment') {
        await supabaseService
          .from("orders")
          .update({
            status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', sessionId);
        logStep("Updated order status to paid");
      }

      // Update subscriber table for subscriptions
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await supabaseService
          .from("subscribers")
          .update({
            subscribed: true,
            subscription_tier: tierType,
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        logStep("Updated subscriber status");
      }

      return new Response(JSON.stringify({ 
        success: true,
        payment_status: 'completed',
        verification_request_id: verificationRequestId 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("Payment not completed", { status: session.payment_status });
      
      // Update verification request with failed payment
      if (verificationRequestId) {
        await supabaseService
          .from("verification_requests")
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', verificationRequestId);
      }

      return new Response(JSON.stringify({ 
        success: false,
        payment_status: session.payment_status,
        verification_request_id: verificationRequestId 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});