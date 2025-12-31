import { SavingsProduct } from 'types/savings';

export function filteredByAmount(product: SavingsProduct, amount: number) {
  return amount >= product.minMonthlyAmount && amount <= product.maxMonthlyAmount;
}

export function filteredByTerm(product: SavingsProduct, term: number | null) {
  if (term == null) {
    return false;
  }

  return product.availableTerms === term;
}

export function orderByAnnualRate(a: SavingsProduct, b: SavingsProduct) {
  return b.annualRate - a.annualRate;
}

export function filteredByProductId(product: SavingsProduct, productId: string | null) {
  if (!productId) {
    return true;
  }
  return product.id === productId;
}
