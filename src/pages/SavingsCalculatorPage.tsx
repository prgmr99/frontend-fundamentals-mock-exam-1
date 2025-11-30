import { useQuery } from '@tanstack/react-query';
import { savingsApi } from 'api/savingsApi';
import { calculateSavingsResult } from 'domain/savings/logics/calculator';
import { filterProducts, getRecommendedProducts } from 'domain/savings/logics/filters';
import { useMemo, useState } from 'react';
import {
  Assets,
  Border,
  colors,
  ListHeader,
  ListRow,
  NavigationBar,
  SelectBottomSheet,
  Spacing,
  Tab,
  TextField,
} from 'tosslib';
import { SavingsProduct } from 'types/savings';
import { formatNumber } from 'utils/formatNumbers';

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
  const { data: savingProducts = [] } = useQuery({
    queryKey: ['savingProducts'],
    queryFn: savingsApi.getProducts,
  });

  // === UI 상태 ===
  const [view, setView] = useView();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [monthlyAmount, setMonthlyAmount] = useState<string>('');
  const [savingPeriod, setSavingPeriod] = useState<number>(12);

  // === 이벤트 핸들러 ===
  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId === selectedProductId ? null : productId);
  };

  const handleTargetAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setTargetAmount(numericValue);
  };

  const handleMonthlyAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setMonthlyAmount(numericValue);
  };

  const handleSavingPeriodChange = (value: number) => {
    setSavingPeriod(value);
  };

  // === 필터링 로직 ===
  const filteredProducts = useMemo(
    () =>
      filterProducts(savingProducts, {
        targetAmount: targetAmount ? parseInt(targetAmount, 10) : 0,
        monthlyAmount: monthlyAmount ? parseInt(monthlyAmount, 10) : 0,
        savingPeriod,
      }),
    [savingProducts, targetAmount, monthlyAmount, savingPeriod]
  );

  // === 추천 상품 ===
  const recommendedProducts = useMemo(() => {
    return getRecommendedProducts(filteredProducts, 2);
  }, [filteredProducts]);

  // === 선택한 상품 찾기 ===
  const selectedProduct = useMemo(() => {
    return savingProducts.find(p => p.id === selectedProductId);
  }, [savingProducts, selectedProductId]);

  // === 계산 결과 ===
  const calculatedResults = useMemo(() => {
    if (!selectedProduct || !monthlyAmount) {
      return null;
    }

    return calculateSavingsResult(
      {
        targetAmount: targetAmount ? parseInt(targetAmount, 10) : 0,
        monthlyAmount: parseInt(monthlyAmount, 10),
        savingPeriod,
      },
      selectedProduct
    );
  }, [selectedProduct, monthlyAmount, targetAmount, savingPeriod]);

  return (
    <>
      <NavigationBar title="적금 계산기" />

      <Spacing size={16} />

      <TextField
        label="목표 금액"
        placeholder="목표 금액을 입력하세요"
        suffix="원"
        value={targetAmount}
        onChange={e => handleTargetAmountChange(e.target.value)}
      />
      <Spacing size={16} />
      <TextField
        label="월 납입액"
        placeholder="희망 월 납입액을 입력하세요"
        suffix="원"
        value={monthlyAmount}
        onChange={e => handleMonthlyAmountChange(e.target.value)}
      />
      <Spacing size={16} />
      <SelectBottomSheet
        label="저축 기간"
        title="저축 기간을 선택해주세요"
        value={savingPeriod}
        onChange={handleSavingPeriodChange}
      >
        <SelectBottomSheet.Option value={6}>6개월</SelectBottomSheet.Option>
        <SelectBottomSheet.Option value={12}>12개월</SelectBottomSheet.Option>
        <SelectBottomSheet.Option value={24}>24개월</SelectBottomSheet.Option>
      </SelectBottomSheet>

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
      {view === 'products' && (
        <>
          {filteredProducts.length === 0 ? (
            <ListRow contents={<ListRow.Texts type="1RowTypeA" top="조건에 맞는 상품이 없습니다." />} />
          ) : (
            filteredProducts.map((product: SavingsProduct) => (
              <ListRow
                key={product.id}
                contents={
                  <ListRow.Texts
                    type="3RowTypeA"
                    top={product.name}
                    topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
                    middle={`연 이자율: ${product.annualRate}%`}
                    middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
                    bottom={`${formatNumber(product.minMonthlyAmount)}원 ~ ${formatNumber(product.maxMonthlyAmount)}원 | ${product.availableTerms}개월`}
                    bottomProps={{ fontSize: 13, color: colors.grey600 }}
                  />
                }
                right={selectedProductId === product.id ? <Assets.Icon name="icon-check-circle-green" /> : undefined}
                onClick={() => handleProductClick(product.id)}
              />
            ))
          )}
        </>
      )}

      {/* === 계산 결과 탭 === */}
      {view === 'results' &&
        (selectedProductId ? (
          <>
            <Spacing size={8} />

            <ListRow
              contents={
                <ListRow.Texts
                  type="2RowTypeA"
                  top="예상 수익 금액"
                  topProps={{ color: colors.grey600 }}
                  bottom={`${calculatedResults ? formatNumber(Math.floor(calculatedResults.finalAmount)) : 0}원`}
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
                  bottom={`${calculatedResults ? formatNumber(Math.floor(calculatedResults.goalDifference)) : 0}원`}
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
                  bottom={`${calculatedResults ? formatNumber(calculatedResults.recommendedMonthlyAmount) : 0}원`}
                  bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
                />
              }
            />

            <Spacing size={8} />
            <Border height={16} />
            <Spacing size={8} />

            <ListHeader
              title={<ListHeader.TitleParagraph fontWeight="bold">추천 상품 목록</ListHeader.TitleParagraph>}
            />
            <Spacing size={12} />

            {recommendedProducts.length === 0 ? (
              <ListRow contents={<ListRow.Texts type="1RowTypeA" top="추천 가능한 상품이 없습니다." />} />
            ) : (
              recommendedProducts.map((product: SavingsProduct) => (
                <ListRow
                  key={product.id}
                  contents={
                    <ListRow.Texts
                      type="3RowTypeA"
                      top={product.name}
                      topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
                      middle={`연 이자율: ${product.annualRate}%`}
                      middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
                      bottom={`${formatNumber(product.minMonthlyAmount)}원 ~ ${formatNumber(product.maxMonthlyAmount)}원 | ${product.availableTerms}개월`}
                      bottomProps={{ fontSize: 13, color: colors.grey600 }}
                    />
                  }
                  right={selectedProductId === product.id ? <Assets.Icon name="icon-check-circle-green" /> : undefined}
                  onClick={() => handleProductClick(product.id)}
                />
              ))
            )}

            <Spacing size={40} />
          </>
        ) : (
          <ListRow contents={<ListRow.Texts type="1RowTypeA" top="상품을 선택해주세요." />} />
        ))}
    </>
  );
}
