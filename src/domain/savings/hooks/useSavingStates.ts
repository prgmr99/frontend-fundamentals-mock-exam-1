import { useState } from 'react';

export const useSavingStates = () => {
  const [filters, setFilters] = useState({
    targetAmount: null as number | null,
    monthlyAmount: null as number | null,
    savingTerm: 12,
  });

  const setSavingStates = (updates: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  return [filters, setSavingStates] as const;
};
