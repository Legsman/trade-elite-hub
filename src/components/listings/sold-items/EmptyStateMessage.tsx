
import React from "react";

export const EmptyStateMessage: React.FC = () => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <h3 className="text-lg font-medium mb-2">No sold items yet</h3>
      <p className="text-sm">Items you sell will appear here.</p>
    </div>
  );
};
