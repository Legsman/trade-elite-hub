export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bid_attempt_logs: {
        Row: {
          attempted_amount: number | null
          attempted_at: string | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          listing_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempted_amount?: number | null
          attempted_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          listing_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_amount?: number | null
          attempted_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          listing_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          bid_increment: number
          created_at: string
          id: string
          listing_id: string
          maximum_bid: number
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bid_increment?: number
          created_at?: string
          id?: string
          listing_id: string
          maximum_bid?: number
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bid_increment?: number
          created_at?: string
          id?: string
          listing_id?: string
          maximum_bid?: number
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_auto_expiry"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications_log: {
        Row: {
          created_at: string
          email_address: string
          id: string
          membership_expires_at: string | null
          notification_type: string
          reminder_days: number | null
          sent_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_address: string
          id?: string
          membership_expires_at?: string | null
          notification_type: string
          reminder_days?: number | null
          sent_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_address?: string
          id?: string
          membership_expires_at?: string | null
          notification_type?: string
          reminder_days?: number | null
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          from_user_id: string
          id: string
          listing_id: string
          rating: number
          to_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          listing_id: string
          rating: number
          to_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          listing_id?: string
          rating?: number
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_feedback_from_user"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_feedback_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_feedback_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_auto_expiry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_feedback_to_user"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_views: {
        Row: {
          id: string
          ip_address: string | null
          listing_id: string
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          listing_id: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          listing_id?: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          allow_best_offer: boolean
          bid_increment: number | null
          category: string
          condition: string
          created_at: string
          current_bid: number | null
          description: string
          expires_at: string
          highest_bidder_id: string | null
          id: string
          images: string[]
          location: string
          price: number
          sale_amount: number | null
          sale_buyer_id: string | null
          sale_date: string | null
          saves: number
          seller_id: string
          status: string
          title: string
          type: string
          updated_at: string
          views: number
        }
        Insert: {
          allow_best_offer?: boolean
          bid_increment?: number | null
          category: string
          condition: string
          created_at?: string
          current_bid?: number | null
          description: string
          expires_at: string
          highest_bidder_id?: string | null
          id?: string
          images?: string[]
          location: string
          price: number
          sale_amount?: number | null
          sale_buyer_id?: string | null
          sale_date?: string | null
          saves?: number
          seller_id: string
          status: string
          title: string
          type: string
          updated_at?: string
          views?: number
        }
        Update: {
          allow_best_offer?: boolean
          bid_increment?: number | null
          category?: string
          condition?: string
          created_at?: string
          current_bid?: number | null
          description?: string
          expires_at?: string
          highest_bidder_id?: string | null
          id?: string
          images?: string[]
          location?: string
          price?: number
          sale_amount?: number | null
          sale_buyer_id?: string | null
          sale_date?: string | null
          saves?: number
          seller_id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_listings_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          has_contact_info: boolean
          id: string
          is_read: boolean
          listing_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          has_contact_info?: boolean
          id?: string
          is_read?: boolean
          listing_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          has_contact_info?: boolean
          id?: string
          is_read?: boolean
          listing_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_auto_expiry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_receiver"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          amount: number
          created_at: string
          id: string
          listing_id: string
          message: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_auto_expiry"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          annual_2fa_payment_date: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string | null
          feedback_rating: number | null
          full_name: string | null
          grace_period_until: string | null
          id: string
          is_two_factor_enabled: boolean | null
          last_payment_date: string | null
          membership_expires_at: string | null
          membership_status: string | null
          payment_methods: Json | null
          phone_number: string | null
          postcode: string | null
          referred_by: string | null
          signup_date: string | null
          strike_count: number | null
          subscription_end_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trading_address: string | null
          updated_at: string
          username: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          annual_2fa_payment_date?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          feedback_rating?: number | null
          full_name?: string | null
          grace_period_until?: string | null
          id: string
          is_two_factor_enabled?: boolean | null
          last_payment_date?: string | null
          membership_expires_at?: string | null
          membership_status?: string | null
          payment_methods?: Json | null
          phone_number?: string | null
          postcode?: string | null
          referred_by?: string | null
          signup_date?: string | null
          strike_count?: number | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trading_address?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          annual_2fa_payment_date?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          feedback_rating?: number | null
          full_name?: string | null
          grace_period_until?: string | null
          id?: string
          is_two_factor_enabled?: boolean | null
          last_payment_date?: string | null
          membership_expires_at?: string | null
          membership_status?: string | null
          payment_methods?: Json | null
          phone_number?: string | null
          postcode?: string | null
          referred_by?: string | null
          signup_date?: string | null
          strike_count?: number | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trading_address?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_title: string
          reason: string
          reporter_id: string | null
          reporter_name: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_title: string
          reason: string
          reporter_id?: string | null
          reporter_name: string
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_title?: string
          reason?: string
          reporter_id?: string | null
          reporter_name?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      saved_listings: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_saved_listings_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_saved_listings_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_auto_expiry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_saved_listings_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage_tracking: {
        Row: {
          created_at: string
          id: string
          month_year: string
          monthly_listings_count: number
          updated_at: string
          user_id: string
          year: number
          yearly_value_total: number
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          monthly_listings_count?: number
          updated_at?: string
          user_id: string
          year: number
          yearly_value_total?: number
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          monthly_listings_count?: number
          updated_at?: string
          user_id?: string
          year?: number
          yearly_value_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          address_proof_url: string | null
          admin_notes: string | null
          business_name: string | null
          business_registration: string | null
          created_at: string
          document_verification_status: string | null
          id: string
          id_document_url: string | null
          insurance_document_url: string | null
          message: string | null
          payment_reference: string | null
          payment_status: string | null
          request_type: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          trading_experience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_proof_url?: string | null
          admin_notes?: string | null
          business_name?: string | null
          business_registration?: string | null
          created_at?: string
          document_verification_status?: string | null
          id?: string
          id_document_url?: string | null
          insurance_document_url?: string | null
          message?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          request_type: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          trading_experience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_proof_url?: string | null
          admin_notes?: string | null
          business_name?: string | null
          business_registration?: string | null
          created_at?: string
          document_verification_status?: string | null
          id?: string
          id_document_url?: string | null
          insurance_document_url?: string | null
          message?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          request_type?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          trading_experience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_verification_requests_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      listings_with_auto_expiry: {
        Row: {
          allow_best_offer: boolean | null
          bid_increment: number | null
          category: string | null
          condition: string | null
          created_at: string | null
          current_bid: number | null
          current_status: string | null
          description: string | null
          expires_at: string | null
          highest_bidder_id: string | null
          id: string | null
          images: string[] | null
          location: string | null
          price: number | null
          sale_amount: number | null
          sale_buyer_id: string | null
          sale_date: string | null
          saves: number | null
          seller_id: string | null
          status: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          allow_best_offer?: boolean | null
          bid_increment?: number | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          current_bid?: number | null
          current_status?: never
          description?: string | null
          expires_at?: string | null
          highest_bidder_id?: string | null
          id?: string | null
          images?: string[] | null
          location?: string | null
          price?: number | null
          sale_amount?: number | null
          sale_buyer_id?: string | null
          sale_date?: string | null
          saves?: number | null
          seller_id?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          allow_best_offer?: boolean | null
          bid_increment?: number | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          current_bid?: number | null
          current_status?: never
          description?: string | null
          expires_at?: string | null
          highest_bidder_id?: string | null
          id?: string | null
          images?: string[] | null
          location?: string | null
          price?: number | null
          sale_amount?: number | null
          sale_buyer_id?: string | null
          sale_date?: string | null
          saves?: number | null
          seller_id?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_listings_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      audit_and_fix_auction_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          listing_id: string
          issue_type: string
          old_value: string
          new_value: string
        }[]
      }
      get_listing_with_expiry_check: {
        Args: { listing_id: string }
        Returns: {
          allow_best_offer: boolean
          bid_increment: number | null
          category: string
          condition: string
          created_at: string
          current_bid: number | null
          description: string
          expires_at: string
          highest_bidder_id: string | null
          id: string
          images: string[]
          location: string
          price: number
          sale_amount: number | null
          sale_buyer_id: string | null
          sale_date: string | null
          saves: number
          seller_id: string
          status: string
          title: string
          type: string
          updated_at: string
          views: number
        }[]
      }
      get_listings_with_expiry_check: {
        Args: Record<PropertyKey, never>
        Returns: {
          allow_best_offer: boolean
          bid_increment: number | null
          category: string
          condition: string
          created_at: string
          current_bid: number | null
          description: string
          expires_at: string
          highest_bidder_id: string | null
          id: string
          images: string[]
          location: string
          price: number
          sale_amount: number | null
          sale_buyer_id: string | null
          sale_date: string | null
          saves: number
          seller_id: string
          status: string
          title: string
          type: string
          updated_at: string
          views: number
        }[]
      }
      get_membership_data_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          full_name: string
          email: string
          membership_expires_at: string
          membership_status: string
          last_payment_date: string
          grace_period_until: string
          signup_date: string
          created_at: string
          verification_level: string
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: string
        }[]
      }
      get_user_roles_batch: {
        Args: { user_ids: string[] }
        Returns: {
          user_id: string
          is_admin: boolean
          is_verified: boolean
          is_trader: boolean
        }[]
      }
      get_user_verification_level: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role_type"]
        }
        Returns: boolean
      }
      increment_views: {
        Args: { l_id: string }
        Returns: {
          listing_id: string
          new_views: number
        }[]
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      proxy_place_or_update_bid: {
        Args: {
          p_listing_id: string
          p_bid_id: string
          p_user_id: string
          p_new_maximum: number
        }
        Returns: {
          listing_id: string
          new_current_bid: number
          highest_bidder_id: string
          is_highest_bidder: boolean
        }[]
      }
      rpc_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_admin: boolean
        }[]
      }
      update_expired_listings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role_type: "unverified" | "verified" | "admin" | "trader"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role_type: ["unverified", "verified", "admin", "trader"],
    },
  },
} as const
