export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
            foreignKeyName: "fk_feedback_to_user"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          allow_best_offer: boolean
          category: string
          condition: string
          created_at: string
          description: string
          expires_at: string
          id: string
          images: string[]
          location: string
          price: number
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
          category: string
          condition: string
          created_at?: string
          description: string
          expires_at: string
          id?: string
          images?: string[]
          location: string
          price: number
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
          category?: string
          condition?: string
          created_at?: string
          description?: string
          expires_at?: string
          id?: string
          images?: string[]
          location?: string
          price?: number
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
          id: string
          is_two_factor_enabled: boolean | null
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
          id: string
          is_two_factor_enabled?: boolean | null
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
          id?: string
          is_two_factor_enabled?: boolean | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role_type"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role_type: "unverified" | "verified" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role_type: ["unverified", "verified", "admin"],
    },
  },
} as const
