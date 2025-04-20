
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types";

export interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: Error }>;
  signup: (data: SignupData) => Promise<{ error?: Error }>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  tradingAddress?: string;
  companyName?: string;
  phoneNumber?: string;
  referredBy?: string;
}
