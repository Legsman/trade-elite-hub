
import { useCallback } from "react";
import { UserAdmin } from "../types";
import { supabase } from "@/integrations/supabase/client";

export function useVerificationManagement(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  startOperation: (type: string, id: string) => string,
  finishOperation: (key: string) => void
) {
  const toggleVerifiedStatus = useCallback(async (userId: string, targetStatus: "verified" | "unverified" | "trader") => {
    // Determine the action based on target status
    let newStatus: "verified" | "unverified" | "trader";
    let action: string;
    let role: string;
    
    if (targetStatus === "unverified") {
      newStatus = "unverified";
      action = "remove";
      role = "verified";
    } else if (targetStatus === "verified") {
      newStatus = "verified";
      action = "add";
      role = "verified";
    } else {
      // targetStatus === "trader"
      newStatus = "trader";
      action = "add";
      role = "trader";
    }
    const operationKey = startOperation("verify", userId);

    try {
      // Optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, verified_status: newStatus } 
            : user
        )
      );
      
      console.log(`Sending verification toggle request: ${action} verified role for user ${userId}`);
      
      // First check if verification requires payment
      if (newStatus === "verified" || newStatus === "trader") {
        const { data: feeData } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', `verification_fee_${newStatus}`)
          .single();

        const feeAmount = (feeData?.setting_value as any)?.amount || 0;
        const feeEnabled = (feeData?.setting_value as any)?.enabled || false;

        if (feeEnabled && feeAmount > 0) {
          // Check if user has an active verification request with completed payment
          const { data: verificationData } = await supabase
            .from('verification_requests')
            .select('id, payment_status')
            .eq('user_id', userId)
            .eq('request_type', newStatus)
            .eq('payment_status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1);

          if (!verificationData || verificationData.length === 0) {
            // Revert optimistic update
            setUsers(prev => 
              prev.map(user => {
                if (user.id === userId) {
                  const currentUser = prev.find(u => u.id === userId);
                  return { ...user, verified_status: currentUser?.verified_status || "unverified" };
                }
                return user;
              })
            );

            return { 
              success: false, 
              requiresPayment: true,
              feeAmount: feeAmount,
              tierType: newStatus,
              message: `Payment of £${feeAmount} required for ${newStatus} verification`
            };
          }
        }
      }
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("admin-role-management", {
        body: {
          action: action,
          role: role,
          targetUserId: userId
        }
      });
      
      console.log(`Verification toggle full response:`, { data, error, rawData: JSON.stringify(data) });
      
      if (error) {
        throw new Error(`Failed to toggle verification status: ${error.message}`);
      }
      
      // Enhanced response handling - assume success unless explicitly failed
      const isSuccess = !error && (data === null || data === undefined || data.success !== false);
      const alreadyDone = data?.message?.includes("already") || data?.message?.includes("not found");
      
      if (alreadyDone) {
        console.log(`User ${userId} status was already ${newStatus} - considering operation successful`);
        return { 
          success: true, 
          message: data?.message || `User ${newStatus === "verified" ? "verified" : "unverified"} successfully`,
          alreadyDone: true
        };
      }
      
      if (!isSuccess) {
        throw new Error(data?.message || "Failed to toggle verification status");
      }
      
      return { 
        success: true, 
        message: data?.message || `User ${newStatus === "verified" ? "verified" : "unverified"} successfully`,
        alreadyDone: false
      };
      
    } catch (error) {
      console.error("Error toggling verification status:", error);
      
      // Revert the optimistic update - we need to get the current status from the user
      setUsers(prev => 
        prev.map(user => {
          if (user.id === userId) {
            // Find the current status from the previous state
            const currentUser = prev.find(u => u.id === userId);
            return { ...user, verified_status: currentUser?.verified_status || "unverified" };
          }
          return user;
        })
      );
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to toggle verification status") 
      };
    } finally {
      finishOperation(operationKey);
    }
  }, [setUsers, startOperation, finishOperation]);

  const toggleTraderStatus = useCallback(async (userId: string, currentStatus: "verified" | "trader") => {
    const newStatus = currentStatus === "trader" ? "verified" : "trader";
    const action = newStatus === "trader" ? "add" : "remove";
    const operationKey = startOperation("trader", userId);

    try {
      // Optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, verified_status: newStatus } 
            : user
        )
      );
      
      console.log(`Sending trader toggle request: ${action} trader role for user ${userId}`);
      
      // Check if trader upgrade requires payment
      if (newStatus === "trader") {
        const { data: feeData } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', 'verification_fee_trader')
          .single();

        const feeAmount = (feeData?.setting_value as any)?.amount || 0;
        const feeEnabled = (feeData?.setting_value as any)?.enabled || false;

        if (feeEnabled && feeAmount > 0) {
          // Check if user has an active verification request with completed payment
          const { data: verificationData } = await supabase
            .from('verification_requests')
            .select('id, payment_status')
            .eq('user_id', userId)
            .eq('request_type', 'trader')
            .eq('payment_status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1);

          if (!verificationData || verificationData.length === 0) {
            // Revert optimistic update
            setUsers(prev => 
              prev.map(user => 
                user.id === userId ? { ...user, verified_status: currentStatus } : user
              )
            );

            return { 
              success: false, 
              requiresPayment: true,
              feeAmount: feeAmount,
              tierType: 'trader',
              message: `Payment of £${feeAmount} required for trader verification`
            };
          }
        }
      }
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("admin-role-management", {
        body: {
          action: action,
          role: "trader",
          targetUserId: userId
        }
      });
      
      console.log(`Trader toggle full response:`, { data, error, rawData: JSON.stringify(data) });
      
      if (error) {
        throw new Error(`Failed to toggle trader status: ${error.message}`);
      }
      
      const isSuccess = !error && (data === null || data === undefined || data.success !== false);
      const alreadyDone = data?.message?.includes("already") || data?.message?.includes("not found");
      
      if (alreadyDone) {
        console.log(`User ${userId} status was already ${newStatus} - considering operation successful`);
        return { 
          success: true, 
          message: data?.message || `User ${newStatus === "trader" ? "promoted to trader" : "demoted to verified"} successfully`,
          alreadyDone: true
        };
      }
      
      if (!isSuccess) {
        throw new Error(data?.message || "Failed to toggle trader status");
      }
      
      return { 
        success: true, 
        message: data?.message || `User ${newStatus === "trader" ? "promoted to trader" : "demoted to verified"} successfully`,
        alreadyDone: false
      };
      
    } catch (error) {
      console.error("Error toggling trader status:", error);
      
      // Revert the optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, verified_status: currentStatus } : user
        )
      );
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to toggle trader status") 
      };
    } finally {
      finishOperation(operationKey);
    }
  }, [setUsers, startOperation, finishOperation]);

  return {
    toggleVerifiedStatus,
    toggleTraderStatus
  };
}
