import { SavingsGoal, SavingsProduct } from 'types/savings';

export interface ProductFilter {
  (product: SavingsProduct, goal: SavingsGoal): boolean;
}

export const monthlyAmountFilter: ProductFilter = (product, goal) => {
  if (!goal.monthlyAmount) {
    return true;
  }

  return goal.monthlyAmount >= product.minMonthlyAmount && goal.monthlyAmount <= product.maxMonthlyAmount;
};

export const savingPeriodFilter: ProductFilter = (product, goal) => {
  return product.availableTerms === goal.savingPeriod;
};

export const composeFilters =
  (...filters: ProductFilter[]): ProductFilter =>
  (product, goal) =>
    filters.every(filter => filter(product, goal));

export const filterProducts = (
  products: SavingsProduct[],
  goal: SavingsGoal,
  filters: ProductFilter[] = [monthlyAmountFilter, savingPeriodFilter]
): SavingsProduct[] => {
  const composedFilter = composeFilters(...filters);
  return products.filter(product => composedFilter(product, goal));
};
