
import React from 'react';

interface IdealRange {
  min?: number;
  max?: number;
  unit: string;
  note?: string;
}

interface IdealRanges {
  [key: string]: IdealRange;
}

const getIdealRanges = (aquariumType: string | null): IdealRanges => {
  const isFreshwater = aquariumType === "Freshwater";
  const isPlantedFreshwater = aquariumType === "Planted Freshwater";
  const isFreshwaterInverts = aquariumType === "Freshwater Invertebrates";
  const isSaltwaterFO = aquariumType === "Saltwater Fish-Only (FO)";
  const isFOWLR = aquariumType === "Fish-Only with Live Rock (FOWLR)";
  const isSoftReef = aquariumType === "Soft Coral Reef";
  const isMixedReef = aquariumType === "Mixed Reef (LPS + Soft)";
  const isSPSReef = aquariumType === "SPS Reef (Hard Coral)";
  
  const isSaltwater = isSaltwaterFO || isFOWLR || isSoftReef || isMixedReef || isSPSReef;
  const isReef = isSoftReef || isMixedReef || isSPSReef;

  const ranges: IdealRanges = {
    temperature: {
      min: isSaltwater ? 76 : 72,
      max: isSaltwater ? 80 : 78,
      unit: "°F"
    },
    ph: {
      min: isSaltwater ? 8.1 : 6.5,
      max: isSaltwater ? 8.4 : 7.8,
      unit: ""
    },
    ammonia: {
      min: 0,
      max: 0,
      unit: "ppm",
      note: "Should always be 0"
    },
    nitrite: {
      min: 0,
      max: 0,
      unit: "ppm",
      note: "Should always be 0"
    },
    nitrate: {
      min: 0,
      max: isReef ? 5 : isSaltwater ? 20 : 40,
      unit: "ppm"
    }
  };

  if (isSaltwater) {
    ranges.salinity = { min: 1.023, max: 1.026, unit: "ppt" };
    ranges.alkalinity = { min: 8, max: 12, unit: "dKH" };
  }

  if (isReef) {
    ranges.calcium = { min: 400, max: 450, unit: "ppm" };
    ranges.magnesium = { min: 1250, max: 1350, unit: "ppm" };
    ranges.phosphate = { min: 0, max: 0.03, unit: "ppm" };
  }

  if (isPlantedFreshwater) {
    ranges.co2 = { min: 20, max: 30, unit: "ppm" };
    ranges.gh = { min: 3, max: 8, unit: "dGH" };
    ranges.kh = { min: 3, max: 8, unit: "dKH" };
  }

  if (isFreshwaterInverts) {
    ranges.copper = { min: 0, max: 0, unit: "ppm", note: "Toxic to invertebrates" };
    ranges.gh = { min: 6, max: 12, unit: "dGH" };
    ranges.kh = { min: 4, max: 8, unit: "dKH" };
  }

  return ranges;
};

export const IdealRangeDisplay: React.FC<{ 
  parameter: string; 
  aquariumType: string | null;
  className?: string;
}> = ({ parameter, aquariumType, className = "" }) => {
  const ranges = getIdealRanges(aquariumType);
  const range = ranges[parameter];

  if (!range) return null;

  return (
    <span className={`text-xs text-muted-foreground ml-2 ${className}`}>
      {range.min !== undefined && range.max !== undefined ? (
        range.min === range.max ? (
          `(${range.min} ${range.unit}${range.note ? ` - ${range.note}` : ''})`
        ) : (
          `(${range.min}-${range.max} ${range.unit}${range.note ? ` - ${range.note}` : ''})`
        )
      ) : range.note ? (
        `(${range.note})`
      ) : null}
    </span>
  );
};
