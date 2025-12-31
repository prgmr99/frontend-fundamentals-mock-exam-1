import { parseAsString, useQueryState } from 'nuqs';

export function useProductSelection() {
  return useQueryState('productId', parseAsString);
}
