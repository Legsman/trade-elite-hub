
import { supabase } from "@/integrations/supabase/client";

export type FilterOptions = {
  category?: string;
  type?: string;
  location?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  allowBestOffer?: string;
  searchTerm?: string;
  showCompleted?: string;
};

export const applyListingFilters = (query: any, filters: FilterOptions) => {
  const {
    category,
    type,
    location,
    condition,
    minPrice,
    maxPrice,
    allowBestOffer,
    searchTerm,
    showCompleted,
  } = filters;

  // Filter by status (active or include completed)
  let filteredQuery = query;
  
  if (showCompleted !== "true") {
    filteredQuery = filteredQuery.eq("status", "active");
  } else {
    // If showing completed listings, include both active, completed/expired, and sold
    filteredQuery = filteredQuery.in("status", ["active", "completed", "expired", "sold"]);
  }

  // Apply category filter
  if (category && category !== "all_categories") {
    filteredQuery = filteredQuery.eq("category", category);
  }

  // Apply type filter
  if (type && type !== "all_types") {
    filteredQuery = filteredQuery.eq("type", type);
  }

  // Apply location filter
  if (location && location !== "all_locations") {
    filteredQuery = filteredQuery.eq("location", location);
  }

  // Apply condition filter - normalize condition for case insensitive comparison
  if (condition && condition !== "all_conditions") {
    // Convert conditions like "like_new" to "Like New" format for database comparison
    let formattedCondition = condition;
    
    // Format condition string from filter value (like_new) to database value (Like New)
    if (condition === "like_new") {
      formattedCondition = "Like New";
    } else if (condition === "new") {
      formattedCondition = "New";
    } else if (condition === "used") {
      formattedCondition = "Used";
    } else if (condition === "fair") {
      formattedCondition = "Fair";
    }
    
    filteredQuery = filteredQuery.eq("condition", formattedCondition);
  }

  // Apply price range filters
  if (minPrice) {
    filteredQuery = filteredQuery.gte("price", minPrice);
  }

  if (maxPrice) {
    filteredQuery = filteredQuery.lte("price", maxPrice);
  }

  // Apply best offer filter
  if (allowBestOffer === "true") {
    filteredQuery = filteredQuery.eq("allow_best_offer", true);
  }

  // Apply search term filter
  if (searchTerm) {
    filteredQuery = filteredQuery.ilike("title", `%${searchTerm}%`);
  }

  return filteredQuery;
};
