import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  user_id: string;
  reminder_days: number;
  membership_expires_at: string;
  email_address: string;
  full_name?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { user_id, reminder_days, membership_expires_at, email_address, full_name }: ReminderRequest = await req.json();

    // Check if reminder already sent
    const { data: existingNotification } = await supabase
      .from("email_notifications_log")
      .select("id")
      .eq("user_id", user_id)
      .eq("notification_type", "membership_reminder")
      .eq("reminder_days", reminder_days)
      .eq("membership_expires_at", membership_expires_at)
      .single();

    if (existingNotification) {
      return new Response(JSON.stringify({ message: "Reminder already sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate email content based on reminder days
    const getEmailContent = (days: number) => {
      const expiryDate = new Date(membership_expires_at).toLocaleDateString();
      
      if (days >= 30) {
        return {
          subject: "Membership Renewal Reminder - 1 Month Notice",
          html: `
            <h2>Hi ${full_name || "there"},</h2>
            <p>Your membership will expire in approximately <strong>1 month</strong> on <strong>${expiryDate}</strong>.</p>
            <p>To continue enjoying uninterrupted access to our platform, please renew your membership before the expiry date.</p>
            <p><a href="${req.headers.get("origin")}/settings" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Membership</a></p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Trading Platform Team</p>
          `
        };
      } else if (days >= 7) {
        return {
          subject: "Membership Renewal Reminder - 1 Week Notice",
          html: `
            <h2>Hi ${full_name || "there"},</h2>
            <p>⚠️ Your membership will expire in <strong>1 week</strong> on <strong>${expiryDate}</strong>.</p>
            <p>Don't lose access to your trading privileges! Please renew your membership as soon as possible.</p>
            <p><a href="${req.headers.get("origin")}/settings" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Now</a></p>
            <p>Best regards,<br>The Trading Platform Team</p>
          `
        };
      } else {
        return {
          subject: `Urgent: Membership Expires in ${days} Day${days > 1 ? 's' : ''}`,
          html: `
            <h2>Hi ${full_name || "there"},</h2>
            <p>🚨 <strong>URGENT:</strong> Your membership will expire in <strong>${days} day${days > 1 ? 's' : ''}</strong> on <strong>${expiryDate}</strong>.</p>
            <p>After expiry, your account will be downgraded and you'll lose trading privileges.</p>
            <p><a href="${req.headers.get("origin")}/settings" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Immediately</a></p>
            <p>Contact support if you need assistance with renewal.</p>
            <p>Best regards,<br>The Trading Platform Team</p>
          `
        };
      }
    };

    const emailContent = getEmailContent(reminder_days);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Trading Platform <noreply@yourdomain.com>",
      to: [email_address],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Log the notification
    await supabase.from("email_notifications_log").insert({
      user_id,
      notification_type: "membership_reminder",
      email_address,
      reminder_days,
      membership_expires_at,
    });

    console.log("Membership reminder sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error sending membership reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});