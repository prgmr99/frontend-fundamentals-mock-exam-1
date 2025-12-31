import { colors, ListRow } from 'tosslib';
import { formatKrNumber } from 'utils/formatKrNumbers';
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSavingProductsQueryOptions } from '../queries/getSavingProductsQueryOptions';
import { useProductSelection } from '../hooks/useProductSelection';
import { filteredByProductId } from '../logics/filters';
import { calculateSavingsResult } from '../logics/calculator';
import { useSavingStates } from '../hooks/useSavingStates';

export default function CalculateResult() {
  return (
    <Suspense
      fallback={<ListRow contents={<ListRow.Texts type="1RowTypeA" top="계산 결과를 불러오는 중입니다..." />} />}
    >
      <CalculateResult.Content />
    </Suspense>
  );
}

CalculateResult.Content = function Content() {
  const [selectedProductId] = useProductSelection();
  const [{ targetAmount, monthlyAmount, savingTerm }] = useSavingStates();

  const { data } = useSuspenseQuery(
    getSavingProductsQueryOptions({ filters: [x => filteredByProductId(x, selectedProductId)] })
  );

  const savingProduct = data[0];

  if (savingProduct == null) {
    return <ListRow contents={<ListRow.Texts type="1RowTypeA" top="선택된 적금 상품이 없습니다." />} />;
  }

  if (targetAmount == null || monthlyAmount == null || savingTerm == null) {
    return <ListRow contents={<ListRow.Texts type="1RowTypeA" top="목표 금액과 월 납입액을 입력해주세요." />} />;
  }

  const { finalAmount, goalDifference, recommendedMonthlyAmount } = calculateSavingsResult(
    { targetAmount, monthlyAmount, savingPeriod: savingTerm },
    savingProduct
  );

  return (
    <>
      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="예상 수익 금액"
            topProps={{ color: colors.grey600 }}
            bottom={`${finalAmount ? formatKrNumber(Math.floor(finalAmount)) : 0}원`}
            bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
          />
        }
      />
      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="목표 금액과의 차이"
            topProps={{ color: colors.grey600 }}
            bottom={`${goalDifference ? formatKrNumber(Math.floor(goalDifference)) : 0}원`}
            bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
          />
        }
      />
      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="추천 월 납입 금액"
            topProps={{ color: colors.grey600 }}
            bottom={`${recommendedMonthlyAmount ? formatKrNumber(recommendedMonthlyAmount) : 0}원`}
            bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
          />
        }
      />
    </>
  );
};
