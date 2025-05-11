
import React from "react";
import { SoldItemCard } from "./SoldItemCard";
import { EmptyStateMessage } from "./EmptyStateMessage";
import { Loading } from "@/components/ui/loading";

interface SoldItemsListProps {
  soldItems: any[];
  isLoading: boolean;
  onRelistClick: (item: any) => void;
}

export const SoldItemsList: React.FC<SoldItemsListProps> = ({ 
  soldItems, 
  isLoading, 
  onRelistClick 
}) => {
  if (isLoading) {
    return <Loading message="Loading sold items..." />;
  }
  
  if (soldItems.length === 0) {
    return <EmptyStateMessage />;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Your Sold Items
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {soldItems.map(item => (
          <SoldItemCard 
            key={item.id} 
            item={item} 
            onRelistClick={onRelistClick} 
          />
        ))}
      </div>
    </div>
  );
};
