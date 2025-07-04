
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LIVESTOCK_TYPES = [
  "Fish",
  "Coral", 
  "Invertebrate",
  "Plant",
  "Other"
];

interface CustomizableLivestockTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function CustomizableLivestockTypeSelector({ 
  value, 
  onChange, 
  label = "Type" 
}: CustomizableLivestockTypeSelectorProps) {
  const [customType, setCustomType] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(value === "Other" || !LIVESTOCK_TYPES.includes(value));

  const handleTypeChange = (selectedType: string) => {
    if (selectedType === "Other") {
      setShowCustomInput(true);
      onChange(customType || "Other");
    } else {
      setShowCustomInput(false);
      onChange(selectedType);
    }
  };

  const handleCustomTypeChange = (customValue: string) => {
    setCustomType(customValue);
    onChange(customValue);
  };

  return (
    <div className="space-y-2">
      <Label className="font-display text-primary">{label}</Label>
      <Select onValueChange={handleTypeChange} value={showCustomInput ? "Other" : value}>
        <SelectTrigger className="cyber-input">
          <SelectValue placeholder={`Select ${label.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent>
          {LIVESTOCK_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showCustomInput && (
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">Custom {label}</Label>
          <Input
            placeholder={`Enter custom ${label.toLowerCase()}...`}
            value={customType}
            onChange={(e) => handleCustomTypeChange(e.target.value)}
            className="cyber-input"
          />
        </div>
      )}
    </div>
  );
}
