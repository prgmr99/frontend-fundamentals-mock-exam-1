import type { SavingsProduct, SavingsGoal } from 'types/savings';

export const calculateFinalAmount = (monthlyAmount: number, annualRate: number, months: number): number => {
  const rate = annualRate / 100;

  return Math.floor(monthlyAmount * months * (1 + rate * 0.5));
};

export const calculateRecommendedMonthlyAmount = (targetAmount: number, annualRate: number, months: number): number => {
  const rate = annualRate / 100;
  const monthlyAmount = targetAmount / (months * (1 + rate * 0.5));

  return Math.round(monthlyAmount / 1000) * 1000;
};

export const calculateSavingsResult = (goal: SavingsGoal, product: SavingsProduct) => {
  const finalAmount = calculateFinalAmount(goal.monthlyAmount, product.annualRate, goal.savingPeriod);

  const goalDifference = finalAmount - goal.targetAmount;

  const recommendedMonthlyAmount = calculateRecommendedMonthlyAmount(
    goal.targetAmount,
    product.annualRate,
    goal.savingPeriod
  );

  return {
    finalAmount,
    goalDifference,
    recommendedMonthlyAmount,
  };
};
