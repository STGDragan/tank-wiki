
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { ReminderEmail } from "./_templates/ReminderEmail.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Task {
  task: string;
  due_date: string;
}

interface UserNotification {
  user_id: string;
  email: string;
  full_name: string | null;
  upcoming_tasks: Task[] | null;
  overdue_tasks: Task[] | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Fetching pending maintenance notifications...");

    const { data: notifications, error } = await supabase.rpc(
      "get_pending_maintenance_notifications"
    );

    if (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
    
    const notificationsData = notifications as UserNotification[];

    if (!notificationsData || notificationsData.length === 0) {
      console.log("No pending notifications to send.");
      return new Response(JSON.stringify({ message: "No pending notifications." }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${notificationsData.length} users with pending tasks.`);

    for (const notification of notificationsData) {
      if ((!notification.upcoming_tasks || notification.upcoming_tasks.length === 0) &&
          (!notification.overdue_tasks || notification.overdue_tasks.length === 0)) {
        continue;
      }
      
      console.log(`Preparing email for ${notification.email}...`);

      const emailHtml = await renderAsync(
        React.createElement(ReminderEmail, {
          fullName: notification.full_name,
          upcomingTasks: notification.upcoming_tasks,
          overdueTasks: notification.overdue_tasks,
        })
      );
      
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: "AquaManager <onboarding@resend.dev>",
        to: [notification.email],
        subject: "Your Aquarium Maintenance Reminder",
        html: emailHtml,
      });

      if (emailError) {
        console.error(`Error sending email to ${notification.email}:`, emailError);
      } else {
        console.log(`Email sent successfully to ${notification.email}. ID: ${emailData?.id}`);
      }
    }

    return new Response(JSON.stringify({ message: "Notifications sent successfully." }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in maintenance-reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
