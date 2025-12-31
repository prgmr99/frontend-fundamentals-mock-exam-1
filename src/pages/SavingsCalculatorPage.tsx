import { noop } from '@tanstack/react-query';
import { AmountInput } from 'components/AmountInput';
import CalculateResult from 'domain/savings/components/CalculateResult';
import ProductsList from 'domain/savings/components/ProductsList';
import { useSavingStates } from 'domain/savings/hooks/useSavingStates';
import { filteredByAmount, filteredByTerm, orderByAnnualRate } from 'domain/savings/logics/filters';
import { Suspense, useState } from 'react';
import { Border, ListHeader, NavigationBar, SelectBottomSheet, Spacing, Tab } from 'tosslib';

type TabValue = 'products' | 'results';

/**
 * view(적금 상태 / 계산 결과) 상태 관리 훅
 *
 * why:
 * * 1. Tab 컴포넌트와 연동되는 상태를 별도의 훅으로 분리하여 관리
 * * 2. 관리 방식이 지금은 메모리로 관리하지만, 다양한 방식으로 변경이 가능하기 때문에 확장성 고려
 *
 * @returns view: 현재 탭 값, setView: 탭 값 변경 함수
 */
const useView = () => {
  const [view, setView] = useState<TabValue>('products');

  return [view, setView] as const;
};

export function SavingsCalculatorPage() {
  const [view, setView] = useView();
  const [{ targetAmount, monthlyAmount, savingTerm }, setSavingStates] = useSavingStates();

  return (
    <>
      <NavigationBar title="적금 계산기" />

      <Spacing size={16} />

      <AmountInput
        label="목표 금액"
        placeholder="목표 금액을 입력하세요"
        value={targetAmount}
        onChange={value => setSavingStates({ targetAmount: value })}
      />
      <Spacing size={16} />
      <AmountInput
        label="월 납입액"
        placeholder="희망 월 납입액을 입력하세요"
        value={monthlyAmount}
        onChange={value => setSavingStates({ monthlyAmount: value })}
      />
      <Spacing size={16} />
      <SavingTermSelect
        label="저축 기간"
        value={savingTerm}
        onChange={value => setSavingStates({ savingTerm: value })}
      />

      <Spacing size={24} />
      <Border height={16} />
      <Spacing size={8} />

      <Tab onChange={value => setView(value as TabValue)}>
        <Tab.Item value="products" selected={view === 'products'}>
          적금 상품
        </Tab.Item>
        <Tab.Item value="results" selected={view === 'results'}>
          계산 결과
        </Tab.Item>
      </Tab>

      {/* === 적금 상품 탭 === */}
      {view === 'products' ? (
        <Suspense fallback={<ProductsList.Loading />}>
          <ProductsList
            filters={[x => filteredByAmount(x, Number(monthlyAmount)), x => filteredByTerm(x, savingTerm)]}
          />
        </Suspense>
      ) : null}

      {/* === 계산 결과 탭 === */}
      {view === 'results' ? (
        <>
          <Spacing size={8} />
          <CalculateResult />
          <Spacing size={8} />
          <Border height={16} />
          <Spacing size={8} />
          <ListHeader title={<ListHeader.TitleParagraph fontWeight="bold">추천 상품 목록</ListHeader.TitleParagraph>} />
          <Spacing size={12} />
          <Suspense fallback={<ProductsList.Loading />}>
            <ProductsList
              filters={[x => filteredByAmount(x, Number(monthlyAmount)), x => filteredByTerm(x, savingTerm)]}
              orderBy={orderByAnnualRate}
              limit={2}
            />
          </Suspense>
          <Spacing size={40} />
        </>
      ) : null}
    </>
  );
}

interface SavingTermSelectProps
  extends Omit<React.ComponentProps<typeof SelectBottomSheet>, 'title' | 'onChange' | 'children'> {
  value?: number | null;
  onChange?: (value: number) => void;
}

export function SavingTermSelect({ value, onChange = noop, ...props }: SavingTermSelectProps) {
  return (
    <SelectBottomSheet title="저축 기간을 선택해주세요" value={value ?? undefined} onChange={onChange} {...props}>
      <SelectBottomSheet.Option value={6}>6개월</SelectBottomSheet.Option>
      <SelectBottomSheet.Option value={12}>12개월</SelectBottomSheet.Option>
      <SelectBottomSheet.Option value={24}>24개월</SelectBottomSheet.Option>
    </SelectBottomSheet>
  );
}
