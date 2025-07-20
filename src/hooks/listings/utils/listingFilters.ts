
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
  console.log("🔧 Applying filters:", filters);
  
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

  let filteredQuery = query;

  if (showCompleted !== "true") {
    // Only show active listings that haven't expired
    filteredQuery = filteredQuery
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString());
    console.log("🔧 Filtered to active non-expired listings only");
  } else {
    // Show all statuses when completed listings are requested
    filteredQuery = filteredQuery.in("status", ["active", "completed", "expired", "sold", "ended"]);
    console.log("🔧 Showing all statuses including completed");
  }

  // Apply category filter
  if (category && category !== "all_categories") {
    console.log("🔧 Filtering by category:", category);
    filteredQuery = filteredQuery.eq("category", category);
  }

  // Apply type filter
  if (type && type !== "all_types") {
    console.log("🔧 Filtering by type:", type);
    filteredQuery = filteredQuery.eq("type", type);
  }

  // Apply location filter
  if (location && location !== "all_locations") {
    console.log("🔧 Filtering by location:", location);
    filteredQuery = filteredQuery.eq("location", location);
  }

  // Apply condition filter - normalize condition for case insensitive comparison
  if (condition && condition !== "all_conditions") {
    // Convert conditions like "like_new" to "Like New" format for database comparison
    let formattedCondition = condition;
    
    if (condition === "like_new") {
      formattedCondition = "Like New";
    } else if (condition === "new") {
      formattedCondition = "New";
    } else if (condition === "used") {
      formattedCondition = "Used";
    } else if (condition === "fair") {
      formattedCondition = "Fair";
    }
    
    console.log("🔧 Filtering by condition:", formattedCondition);
    filteredQuery = filteredQuery.eq("condition", formattedCondition);
  }

  // Apply price range filters
  if (minPrice && minPrice !== "0") {
    console.log("🔧 Filtering by minPrice:", minPrice);
    filteredQuery = filteredQuery.gte("price", minPrice);
  }

  if (maxPrice && maxPrice !== "10000") {
    console.log("🔧 Filtering by maxPrice:", maxPrice);
    filteredQuery = filteredQuery.lte("price", maxPrice);
  }

  // Apply best offer filter
  if (allowBestOffer === "true") {
    console.log("🔧 Filtering by allowBestOffer");
    filteredQuery = filteredQuery.eq("allow_best_offer", true);
  }

  // Apply search term filter
  if (searchTerm) {
    console.log("🔧 Filtering by searchTerm:", searchTerm);
    filteredQuery = filteredQuery.ilike("title", `%${searchTerm}%`);
  }

  console.log("🔧 Filters applied successfully");
  return filteredQuery;
};
