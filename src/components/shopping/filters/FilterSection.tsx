
import React from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection = ({ title, isOpen, onToggle, children }: FilterSectionProps) => (
  <Collapsible open={isOpen} onOpenChange={onToggle}>
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        className="flex w-full justify-between p-0 h-auto font-medium text-left hover:bg-transparent"
        onClick={onToggle}
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="space-y-3 mt-3">
      {children}
    </CollapsibleContent>
  </Collapsible>
);

export default FilterSection;
