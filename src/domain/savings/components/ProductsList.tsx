import { useSuspenseQuery } from '@tanstack/react-query';

import { Assets, colors, ListRow } from 'tosslib';
import { FilteredSavingProducts, OrderBySavingProducts, SavingsProduct } from 'types/savings';
import { formatKrNumber } from 'utils/formatKrNumbers';

import { getSavingProductsQueryOptions } from '../queries/getSavingProductsQueryOptions';

import { useProductSelection } from '../hooks/useProductSelection';

interface ProductsListProps {
  filters?: FilteredSavingProducts[];
  orderBy?: OrderBySavingProducts;
  limit?: number;
}

export default function ProductsList({ filters, orderBy, limit = Infinity }: ProductsListProps) {
  const { data: savingProducts = [] } = useSuspenseQuery(getSavingProductsQueryOptions({ filters, orderBy, limit }));

  const [selectedProductId, setSelectedProductId] = useProductSelection();

  if (savingProducts.length === 0) {
    return <ListRow contents={<ListRow.Texts type="1RowTypeA" top="조건에 맞는 상품이 없습니다." />} />;
  }

  return (
    <>
      {savingProducts.map((product: SavingsProduct) => (
        <ListRow
          key={product.id}
          contents={
            <ListRow.Texts
              type="3RowTypeA"
              top={product.name}
              topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
              middle={`연 이자율: ${product.annualRate}%`}
              middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
              bottom={`${formatKrNumber(product.minMonthlyAmount)}원 ~ ${formatKrNumber(product.maxMonthlyAmount)}원 | ${product.availableTerms}개월`}
              bottomProps={{ fontSize: 13, color: colors.grey600 }}
            />
          }
          right={selectedProductId === product.id ? <Assets.Icon name="icon-check-circle-green" /> : undefined}
          onClick={() => setSelectedProductId(product.id)}
        />
      ))}
    </>
  );
}

ProductsList.Empty = <ListRow contents={<ListRow.Texts type="1RowTypeA" top="조건에 맞는 상품이 없습니다." />} />;
ProductsList.Loading = () => (
  <ListRow contents={<ListRow.Texts type="1RowTypeA" top="상품을 불러오는 중입니다..." />} />
);
