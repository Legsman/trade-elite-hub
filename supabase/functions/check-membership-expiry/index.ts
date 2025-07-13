import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const now = new Date().toISOString();
    console.log("Starting membership expiry check at:", now);

    // 1. Handle expired memberships (past expiry date)
    const { data: expiredUsers, error: expiredError } = await supabase
      .from("profiles")
      .select("id, email, full_name, membership_expires_at, membership_status")
      .lt("membership_expires_at", now)
      .eq("membership_status", "active");

    if (expiredError) {
      console.error("Error fetching expired users:", expiredError);
    } else if (expiredUsers && expiredUsers.length > 0) {
      console.log(`Found ${expiredUsers.length} expired memberships`);

      // Revoke roles for expired users
      for (const user of expiredUsers) {
        // Remove verified and trader roles, keep only unverified
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id)
          .in("role", ["verified", "trader"]);

        // Ensure they have unverified role
        await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, role: "unverified" });

        // Update membership status
        await supabase
          .from("profiles")
          .update({ 
            membership_status: "expired",
            grace_period_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 day grace period
          })
          .eq("id", user.id);

        console.log(`Revoked membership for user: ${user.id}`);
      }
    }

    // 2. Handle grace period expiry (complete account suspension)
    const { data: gracePeriodExpired, error: graceError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .lt("grace_period_until", now)
      .eq("membership_status", "expired");

    if (graceError) {
      console.error("Error fetching grace period expired users:", graceError);
    } else if (gracePeriodExpired && gracePeriodExpired.length > 0) {
      console.log(`Found ${gracePeriodExpired.length} users past grace period`);

      for (const user of gracePeriodExpired) {
        await supabase
          .from("profiles")
          .update({ membership_status: "suspended" })
          .eq("id", user.id);

        console.log(`Suspended user past grace period: ${user.id}`);
      }
    }

    // 3. Send daily reminders for upcoming expiries (only once per day)
    const reminderDays = [30, 7, 3, 2, 1];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    for (const days of reminderDays) {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + days);
      const reminderDateStart = new Date(reminderDate);
      reminderDateStart.setHours(0, 0, 0, 0);
      const reminderDateEnd = new Date(reminderDate);
      reminderDateEnd.setHours(23, 59, 59, 999);

      const { data: usersToRemind, error: remindError } = await supabase
        .from("profiles")
        .select("id, email, full_name, membership_expires_at")
        .gte("membership_expires_at", reminderDateStart.toISOString())
        .lte("membership_expires_at", reminderDateEnd.toISOString())
        .eq("membership_status", "active")
        .not("email", "is", null);

      if (remindError) {
        console.error(`Error fetching users for ${days}-day reminder:`, remindError);
        continue;
      }

      if (usersToRemind && usersToRemind.length > 0) {
        console.log(`Found ${usersToRemind.length} users for ${days}-day reminders`);

        // Filter out users who already received today's reminder
        const usersNeedingReminder = [];
        for (const user of usersToRemind) {
          const { data: existingReminder } = await supabase
            .from("email_notifications_log")
            .select("id")
            .eq("user_id", user.id)
            .eq("notification_type", "membership_reminder")
            .eq("reminder_days", days)
            .gte("sent_at", `${today}T00:00:00Z`)
            .lt("sent_at", `${today}T23:59:59Z`)
            .maybeSingle();
          
          if (!existingReminder) {
            usersNeedingReminder.push(user);
          }
        }

        if (usersNeedingReminder.length > 0) {
          console.log(`Sending ${days}-day reminders to ${usersNeedingReminder.length} users (filtered duplicates)`);

          // Send reminders
          for (const user of usersNeedingReminder) {
            try {
              const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-membership-reminder`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                },
                body: JSON.stringify({
                  user_id: user.id,
                  reminder_days: days,
                  membership_expires_at: user.membership_expires_at,
                  email_address: user.email,
                  full_name: user.full_name,
                }),
              });

              if (!response.ok) {
                console.error(`Failed to send reminder to ${user.email}:`, await response.text());
              } else {
                console.log(`Reminder sent to ${user.email} for ${days}-day notice`);
              }
            } catch (error) {
              console.error(`Error sending reminder to ${user.email}:`, error);
            }
          }
        } else {
          console.log(`All users for ${days}-day reminder already notified today`);
        }
      }
    }

    const summary = {
      expired_memberships: expiredUsers?.length || 0,
      grace_period_expired: gracePeriodExpired?.length || 0,
      timestamp: now,
    };

    console.log("Membership check completed:", summary);

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in membership expiry check:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
