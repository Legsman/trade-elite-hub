import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

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
  id_document_url?: string;
  address_proof_url?: string;
  insurance_document_url?: string;
  document_verification_status?: string;
  payment_status?: string;
  payment_reference?: string;
}

export function useVerificationRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const createVerificationRequest = async (requestData: Partial<VerificationRequest>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      
      const { data, error: createError } = await supabase
        .from("verification_requests")
        .insert({
          user_id: user.id,
          request_type: requestData.request_type,
          message: requestData.message,
          business_name: requestData.business_name,
          business_registration: requestData.business_registration,
          trading_experience: requestData.trading_experience,
          id_document_url: requestData.id_document_url,
          address_proof_url: requestData.address_proof_url,
          insurance_document_url: requestData.insurance_document_url,
          document_verification_status: requestData.document_verification_status || 'pending',
          payment_status: requestData.payment_status || 'pending',
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;

      // Refresh the requests list
      await fetchRequests();
      
      return true;
    } catch (err) {
      console.error("Error creating verification request:", err);
      toast({
        title: "Error",
        description: "Failed to create verification request",
        variant: "destructive",
      });
      return false;
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
    createVerificationRequest,
  };
}