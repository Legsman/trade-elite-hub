
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SoldItemCardProps {
  item: any;
  onRelistClick: (item: any) => void;
}

export const SoldItemCard: React.FC<SoldItemCardProps> = ({ item, onRelistClick }) => {
  const navigate = useNavigate();
  
  return (
    <Card key={item.id} className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/4 md:w-1/5">
          <img 
            src={item.images[0]} 
            alt={item.title} 
            className="w-full h-40 object-cover"
          />
        </div>
        <div className="p-4 flex-1">
          <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
          <div className="text-sm text-muted-foreground mb-2">
            {item.saleDate
              ? new Intl.DateTimeFormat('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }).format(item.saleDate)
              : ""}
          </div>
          <div className="mb-2">
            <span className="font-medium">Sale price:</span>{' '}
            <span className="text-green-600 font-bold">
              £{item.saleAmount ? Number(item.saleAmount).toLocaleString() : "-"}
            </span>
          </div>
          {item.buyer && (
            <div className="mb-4 text-sm">
              <span className="font-medium">Buyer:</span>{' '}
              <span>{item.buyer.username}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/listings/${item.id}`)}
            >
              View Details
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRelistClick(item)}
            >
              Relist Item
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
