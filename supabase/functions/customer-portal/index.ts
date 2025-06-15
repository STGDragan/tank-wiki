
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
    );
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    const { data: subscriber, error: subscriberError } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscriberError) throw subscriberError;
    if (!subscriber?.stripe_customer_id) {
        // If no stripe_customer_id, try to find by email
        const { data: customerData } = await new Stripe(stripeKey, { apiVersion: "2023-10-16" }).customers.list({ email: user.email, limit: 1 });
        if (customerData.length === 0) {
            throw new Error("No Stripe customer found for this user.");
        }
        subscriber.stripe_customer_id = customerData[0].id;
    }
    
    logStep("Found stripe customer id", { customerId: subscriber.stripe_customer_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscriber.stripe_customer_id,
      return_url: `${req.headers.get("origin")}/account`,
    });
    
    logStep("Portal session created", { sessionId: portalSession.id });

    return new Response(JSON.stringify({ url: portalSession.url }), {
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
