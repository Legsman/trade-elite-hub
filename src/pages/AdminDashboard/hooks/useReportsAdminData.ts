
import { useState, useEffect } from "react";
import { ReportAdmin } from "../types";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../constants";

export function useReportsAdminData(userIdToName: Record<string, string> = {}) {
  const [reports, setReports] = useState<ReportAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const result = await fetch(
        `${SUPABASE_URL}/rest/v1/reports?select=*`,
        {
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      const reportsRaw = await result.json();

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
      setLoading(false);
    }

    fetchReports();
  }, [userIdToName]);

  return { reports, loading, setReports };
}
