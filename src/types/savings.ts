/**
 * 적금 상품 정보
 */
export interface SavingsProduct {
  id: string;
  name: string;
  annualRate: number;
  minMonthlyAmount: number;
  maxMonthlyAmount: number;
  availableTerms: number;
}

/**
 * 사용자의 저축 목표
 */
export interface SavingsGoal {
  targetAmount: number;
  monthlyAmount: number;
  savingPeriod: number;
}
