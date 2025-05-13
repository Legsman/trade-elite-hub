/// <reference types="vite/client" />

// Extend Supabase types to include our custom RPC functions
interface Database {
  public: {
    Tables: {
      // ... existing tables
    };
    Functions: {
      proxy_place_or_update_bid: {
        Args: {
          p_listing_id: string;
          p_bid_id: string | null;
          p_user_id: string;
          p_new_maximum: number;
        };
        Returns: {
          listing_id: string;
          new_current_bid: number;
          highest_bidder_id: string;
          is_highest_bidder: boolean;
        }[];
      };
      get_user_roles: {
        Args: {
          _user_id: string;
        };
        Returns: {
          role: string;
        }[];
      };
      get_user_roles_batch: {
        Args: {
          user_ids: string[];
        };
        Returns: {
          user_id: string;
          is_admin: boolean;
          is_verified: boolean;
        }[];
      };
      has_role: {
        Args: {
          _user_id: string;
          _role: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: {
          _user_id: string;
        };
        Returns: boolean;
      };
      rpc_is_admin: {
        Args: Record<string, never>;
        Returns: {
          is_admin: boolean;
        }[];
      };
    };
  };
}
