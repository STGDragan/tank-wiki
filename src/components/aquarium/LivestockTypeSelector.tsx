
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LivestockTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  aquariumType: string | null;
}

const getLivestockTypes = (aquariumType: string | null) => {
  const baseTypes = [
    { value: "fish", label: "Fish" },
    { value: "invertebrate", label: "Invertebrates" },
    { value: "plant", label: "Plants" }
  ];

  if (aquariumType === "saltwater" || aquariumType === "reef") {
    return [
      ...baseTypes,
      { value: "coral", label: "Corals" },
      { value: "anemone", label: "Anemones" },
      { value: "clam", label: "Clams" }
    ];
  }

  return baseTypes;
};

export function LivestockTypeSelector({ value, onChange, aquariumType }: LivestockTypeSelectorProps) {
  const livestockTypes = getLivestockTypes(aquariumType);

  return (
    <FormItem>
      <FormLabel>Livestock Type</FormLabel>
      <Select value={value} onValueChange={onChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select livestock type..." />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-64">
          {livestockTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
