
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterState } from "../FilterSidebar";

interface CompatibilityTag {
  id: string;
  name: string;
  description: string;
  tag_type: string;
}

interface CompatibilityTagsFilterProps {
  compatibilityTags: CompatibilityTag[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const CompatibilityTagsFilter = ({ compatibilityTags, filters, onFiltersChange }: CompatibilityTagsFilterProps) => {
  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: newArray });
  };

  const compatibilityTagsByType = compatibilityTags.reduce((acc, tag) => {
    if (!acc[tag.tag_type]) acc[tag.tag_type] = [];
    acc[tag.tag_type].push(tag);
    return acc;
  }, {} as Record<string, CompatibilityTag[]>);

  return (
    <div className="space-y-4">
      {Object.entries(compatibilityTagsByType).map(([type, tags]) => (
        <div key={type} className="space-y-2">
          <h4 className="text-sm font-medium capitalize text-muted-foreground">
            {type.replace('_', ' ')}
          </h4>
          <div className="space-y-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`compat-${tag.id}`}
                  checked={filters.compatibilityTags.includes(tag.id)}
                  onCheckedChange={() => toggleArrayFilter('compatibilityTags', tag.id)}
                />
                <label
                  htmlFor={`compat-${tag.id}`}
                  className="text-sm leading-none cursor-pointer"
                  title={tag.description}
                >
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompatibilityTagsFilter;
