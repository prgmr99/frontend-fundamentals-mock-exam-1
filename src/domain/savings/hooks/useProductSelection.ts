import { useState } from 'react';

export function useProductSelection() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  return [selectedProductId, setSelectedProductId] as const;
}
