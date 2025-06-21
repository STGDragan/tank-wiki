
// Auto-populate tank dimensions based on size
export const standardTankDimensions: Record<number, { length: number; width: number; height: number; shape: string }> = {
  // Nano tanks
  5: { length: 16, width: 10, height: 10, shape: 'rectangular' },
  10: { length: 20, width: 10, height: 12, shape: 'rectangular' },
  15: { length: 24, width: 12, height: 12, shape: 'rectangular' },
  20: { length: 24, width: 12, height: 16, shape: 'rectangular' },
  
  // Small tanks
  25: { length: 24, width: 12, height: 20, shape: 'rectangular' },
  29: { length: 30, width: 12, height: 18, shape: 'rectangular' },
  30: { length: 36, width: 12, height: 16, shape: 'rectangular' },
  40: { length: 36, width: 18, height: 16, shape: 'rectangular' },
  
  // Medium tanks
  50: { length: 36, width: 18, height: 19, shape: 'rectangular' },
  55: { length: 48, width: 13, height: 21, shape: 'rectangular' },
  60: { length: 48, width: 12, height: 24, shape: 'rectangular' },
  75: { length: 48, width: 18, height: 21, shape: 'rectangular' },
  
  // Large tanks
  90: { length: 48, width: 18, height: 24, shape: 'rectangular' },
  100: { length: 60, width: 18, height: 20, shape: 'rectangular' },
  125: { length: 72, width: 18, height: 21, shape: 'rectangular' },
  150: { length: 72, width: 18, height: 28, shape: 'rectangular' },
  
  // Bow front variants
  36: { length: 30, width: 15, height: 20, shape: 'bow-front' },
  46: { length: 36, width: 15, height: 20, shape: 'bow-front' },
  
  // Corner tanks
  32: { length: 24, width: 24, height: 20, shape: 'corner' },
  54: { length: 30, width: 30, height: 24, shape: 'corner' }
};

export const getTankDimensions = (size: number) => {
  return standardTankDimensions[size] || null;
};
