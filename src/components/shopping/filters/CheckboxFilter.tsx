
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterState } from "../FilterSidebar";

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxFilterProps {
  options: CheckboxOption[];
  filterKey: keyof FilterState;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const CheckboxFilter = ({ options, filterKey, filters, onFiltersChange }: CheckboxFilterProps) => {
  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: newArray });
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`${filterKey}-${option.value}`}
            checked={(filters[filterKey] as string[]).includes(option.value)}
            onCheckedChange={() => toggleArrayFilter(filterKey, option.value)}
          />
          <label
            htmlFor={`${filterKey}-${option.value}`}
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CheckboxFilter;
