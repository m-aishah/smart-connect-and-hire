"use client";

import { cn } from "@/lib/utils";
import { 
  Palette, 
  Code, 
  LineChart, 
  Briefcase, 
  HeartPulse, 
  MoreHorizontal,
  LayoutGrid
} from "lucide-react";

const categories = [
  { id: "all", label: "All Categories", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "design", label: "Design & Creative", icon: <Palette className="w-4 h-4" /> },
  { id: "development", label: "Development & IT", icon: <Code className="w-4 h-4" /> },
  { id: "marketing", label: "Marketing", icon: <LineChart className="w-4 h-4" /> },
  { id: "business", label: "Business", icon: <Briefcase className="w-4 h-4" /> },
  { id: "lifestyle", label: "Lifestyle", icon: <HeartPulse className="w-4 h-4" /> },
  { id: "other", label: "Other", icon: <MoreHorizontal className="w-4 h-4" /> },
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="mb-8 w-full overflow-hidden">
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
              selectedCategory === category.id
                ? "bg-purple-600 text-white"
                : "bg-white text-purple-700 hover:bg-purple-50"
            )}
          >
            <span className="grid place-items-center">
              {category.icon}
            </span>
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;