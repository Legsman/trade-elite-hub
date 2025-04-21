
import { useState, useEffect } from "react";
import { ReportAdmin } from "../types";
import { supabase } from "@/integrations/supabase/client";

export function useReportsAdminData(userIdToName: Record<string, string> = {}) {
  const [reports, setReports] = useState<ReportAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);
        
        // Use direct query to avoid potential recursion with RLS policies
        const { data: reportsRaw, error: reportsError } = await supabase
          .from("reports")
          .select("*");
        
        if (reportsError) {
          console.error("Error fetching reports:", reportsError);
          setError(reportsError.message);
          setReports([]);
          return;
        }
        
        setReports(
          (reportsRaw || []).map((report: any) => ({
            id: report.id,
            type: report.type,
            item_id: report.item_id,
            item_title: report.item_title || (report.type === "user"
              ? "User: " + userIdToName[report.item_id]
              : "Unknown"),
            reporter_name: report.reporter_name || "System",
            reporter_id: report.reporter_id,
            reason: report.reason,
            status: report.status,
            created_at: report.created_at,
          }))
        );
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err instanceof Error ? err.message : String(err));
        setReports([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [userIdToName]);

  return { reports, loading, setReports, error };
}
