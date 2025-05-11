
import { supabase } from "@/integrations/supabase/client";

export interface SortConfig {
  field: string;
  ascending: boolean;
}

export const getSortConfig = (sortBy: string = "newest"): SortConfig => {
  // Default sort configuration
  let dbSortField = "created_at";
  let isAscending = false;

  switch (sortBy) {
    case "newest":
      dbSortField = "created_at";
      isAscending = false;
      break;
    case "oldest":
      dbSortField = "created_at";
      isAscending = true;
      break;
    case "price-low":
    case "price-asc":
      dbSortField = "price";
      isAscending = true;
      break;
    case "price-high": 
    case "price-desc":
      dbSortField = "price";
      isAscending = false;
      break;
    case "popular":
      dbSortField = "views";
      isAscending = false;
      break;
    default:
      // If sortBy contains a dash, parse it
      if (sortBy && sortBy.includes("-")) {
        const [field, order] = sortBy.split("-");
        if (field === "created_at" || field === "price") {
          dbSortField = field;
          isAscending = order === "asc";
        }
      }
      break;
  }

  return { field: dbSortField, ascending: isAscending };
};

export const applySorting = (query: any, sortConfig: SortConfig) => {
  return query.order(sortConfig.field, { ascending: sortConfig.ascending });
};
