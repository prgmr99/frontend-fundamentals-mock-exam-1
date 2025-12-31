import { useQueryStates, parseAsInteger } from 'nuqs';

export const useSavingStates = () => {
  return useQueryStates({
    targetAmount: parseAsInteger,
    monthlyAmount: parseAsInteger,
    savingTerm: parseAsInteger,
  });
};
