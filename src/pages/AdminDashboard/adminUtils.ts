
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Function to safely check if a user has access to admin features
export const checkAdminAccess = async (userId: string): Promise<boolean> => {
  try {
    // This function would check if a user has admin privileges
    // It could make a call to Supabase or check local storage
    return true; // Placeholder - should actually check admin status
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};
