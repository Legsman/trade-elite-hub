
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user_id from the request
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Get all the users the current user has had conversations with
    const { data: conversations, error } = await supabase.from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        receiver_id,
        is_read,
        sender:sender_id (
          id,
          full_name,
          avatar_url
        ),
        receiver:receiver_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Process the data to get unique contacts with their latest message
    const contactsMap = new Map();

    conversations.forEach(message => {
      // Determine if this user is the sender or receiver
      const isUserSender = message.sender_id === user_id;
      const contactId = isUserSender ? message.receiver_id : message.sender_id;
      const contact = isUserSender ? message.receiver : message.sender;

      if (!contactsMap.has(contactId)) {
        // This is the first message with this contact
        contactsMap.set(contactId, {
          id: contact.id,
          full_name: contact.full_name,
          avatar_url: contact.avatar_url,
          latest_message: message.content,
          latest_timestamp: message.created_at,
          unread_count: !isUserSender && !message.is_read ? 1 : 0,
          user_id: contactId
        });
      } else {
        // We already have a message with this contact, update unread count
        if (!isUserSender && !message.is_read) {
          const existingContact = contactsMap.get(contactId);
          existingContact.unread_count += 1;
          contactsMap.set(contactId, existingContact);
        }
      }
    });

    // Convert the map to an array
    const contacts = Array.from(contactsMap.values());

    return new Response(
      JSON.stringify(contacts),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
