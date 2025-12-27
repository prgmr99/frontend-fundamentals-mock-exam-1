import { queryOptions } from '@tanstack/react-query';
import { savingsApi } from 'api/savingsApi';
import { FilteredSavingProducts, OrderBySavingProducts, SavingsProduct } from 'types/savings';

interface Options {
  filters?: FilteredSavingProducts[];
  orderBy?: OrderBySavingProducts;
  limit?: number;
}

export function getSavingProductsQueryOptions({ filters, orderBy, limit }: Options) {
  return queryOptions<SavingsProduct[]>({
    queryKey: ['savingProducts'] as const,
    queryFn: savingsApi.getProducts,
    select: (data: Awaited<ReturnType<typeof savingsApi.getProducts>>) => {
      const filteredData = data.filter(x => filters?.every(filter => filter(x)));

      if (orderBy != null) {
        filteredData.sort(orderBy).slice(0, limit);
      }

      return filteredData.slice(0, limit);
    },
  });
}
