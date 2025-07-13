import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MEMBERSHIP-RENEWAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { membership_fee, tier_type, billing_cycle_id } = await req.json();
    logStep("Processing membership renewal", { userId: user.id, membershipFee: membership_fee, tier: tier_type });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session for membership renewal
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: `${tier_type.charAt(0).toUpperCase() + tier_type.slice(1)} Membership Renewal`,
              description: "Annual membership renewal"
            },
            unit_amount: Math.round(membership_fee * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=cancelled`,
      metadata: {
        type: "membership_renewal",
        user_id: user.id,
        tier_type: tier_type,
        billing_cycle_id: billing_cycle_id || "",
      },
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Update billing cycle with payment session ID
    if (billing_cycle_id) {
      const { data: cycleData, error: fetchError } = await supabaseClient
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', `billing_cycle_${billing_cycle_id}`)
        .single();

      if (!fetchError && cycleData) {
        const cycle = cycleData.setting_value as any;
        const updatedCycle = {
          ...cycle,
          stripe_session_id: session.id,
          updated_at: new Date().toISOString(),
        };

        await supabaseClient
          .from('system_settings')
          .update({ setting_value: updatedCycle })
          .eq('setting_key', `billing_cycle_${billing_cycle_id}`);
      }
    }

    // Create order record
    await supabaseClient.from("orders").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      amount: Math.round(membership_fee * 100),
      currency: "gbp",
      status: "pending",
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in membership renewal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});