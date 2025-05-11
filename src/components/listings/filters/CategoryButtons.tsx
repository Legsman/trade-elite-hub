
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CategoryButtonsProps {
  category: string;
  onCategoryChange: (value: string) => void;
}

export const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  category,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("category")
          .eq("status", "active")
          .order("category");

        if (error) {
          throw error;
        }

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((item) => item.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Select value={category} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all_categories">All Categories</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
