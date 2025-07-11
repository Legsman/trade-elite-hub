import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface VerificationRequest {
  id: string;
  user_id: string;
  request_type: "verified" | "trader";
  status: "pending" | "approved" | "rejected";
  message?: string;
  business_name?: string;
  business_registration?: string;
  trading_experience?: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
}

export function useVerificationRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", user?.id)
        .order("requested_at", { ascending: false });

      if (fetchError) throw fetchError;

      setRequests((data || []) as VerificationRequest[]);
    } catch (err) {
      console.error("Error fetching verification requests:", err);
      setError("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveRequest = requests.some(
    (request) => request.status === "pending"
  );

  const latestRequest = requests[0];

  return {
    requests,
    loading,
    error,
    hasActiveRequest,
    latestRequest,
    refetch: fetchRequests,
  };
}