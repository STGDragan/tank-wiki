
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { data: customerData } = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customerData.length === 0) {
      logStep("No Stripe customer found, ensuring local record is unsubscribed");
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        stripe_customer_id: null,
      }, { onConflict: 'user_id' });
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customerData[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
      expand: ['data.plan.product']
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const sub = subscriptions.data[0];
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      if (typeof sub.plan.product === 'object' && sub.plan.product !== null) {
        subscriptionTier = sub.plan.product.name;
      } else {
        subscriptionTier = "Pro";
      }
      logStep("Active subscription found", { tier: subscriptionTier, end: subscriptionEnd });
    } else {
      logStep("No active subscription found");
    }

    await supabaseClient.from("subscribers").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
    }, { onConflict: 'user_id' });

    logStep("Updated subscriber record in DB");

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Error", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
