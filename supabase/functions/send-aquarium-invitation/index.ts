
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { InvitationEmail } from "./_templates/InvitationEmail.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  aquariumId: string;
  invitedEmail: string;
  permission: string;
  aquariumName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting invitation email process...");

    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("RESEND_API_KEY is not configured");
    }
    console.log("RESEND_API_KEY found");

    const resend = new Resend(resendApiKey);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
      throw new Error("No authorization header");
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized");
    }

    console.log("User authenticated:", user.id);

    const { aquariumId, invitedEmail, permission, aquariumName }: InvitationRequest = await req.json();

    console.log(`Processing invitation for aquarium ${aquariumName} to ${invitedEmail}`);

    // Get the invitation details from the database
    const { data: invitation, error: invitationError } = await supabase
      .from("aquarium_share_invitations")
      .select("invitation_token, owner_user_id")
      .eq("aquarium_id", aquariumId)
      .eq("invited_email", invitedEmail)
      .eq("owner_user_id", user.id)
      .single();

    if (invitationError || !invitation) {
      console.error("Invitation not found:", invitationError);
      throw new Error("Invitation not found in database");
    }

    console.log("Found invitation token:", invitation.invitation_token);

    // Get the owner's profile for the email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const ownerName = profile?.full_name || user.email || "Someone";
    
    // Create the accept URL - use the current domain instead of hardcoded URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL environment variable not found");
    }
    
    // Extract the project domain from the Supabase URL and construct the app URL
    const projectId = supabaseUrl.split('//')[1].split('.')[0];
    const acceptUrl = `https://${projectId}.lovableproject.com/accept-invitation/${invitation.invitation_token}`;

    console.log("Accept URL:", acceptUrl);

    // Render the email template
    const emailHtml = await renderAsync(
      React.createElement(InvitationEmail, {
        aquariumName,
        ownerName,
        invitedEmail,
        permission,
        acceptUrl,
      })
    );

    console.log("Email template rendered successfully");

    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "AquaManager <onboarding@resend.dev>",
      to: [invitedEmail],
      subject: `You've been invited to view ${aquariumName}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw new Error(`Email sending failed: ${emailError.message}`);
    }

    console.log(`Email sent successfully to ${invitedEmail}. ID: ${emailData?.id}`);

    return new Response(JSON.stringify({ success: true, emailId: emailData?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-aquarium-invitation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
