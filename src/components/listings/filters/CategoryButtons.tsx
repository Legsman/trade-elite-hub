
import React from "react";
import { Button } from "@/components/ui/button";

interface CategoryButtonsProps {
  category: string;
  onCategoryChange: (value: string) => void;
}

export const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  category,
  onCategoryChange,
}) => {
  const categories = ["electronics", "clothing", "furniture", "books", "sports"];
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={category === "all_categories" ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange("all_categories")}
      >
        All Categories
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={category === cat ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(cat)}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </Button>
      ))}
    </div>
  );
};
