import { http } from 'tosslib';

export interface SavingsProduct {
  id: string;
  name: string;
  annualRate: number;
  minMonthlyAmount: number;
  maxMonthlyAmount: number;
  availableTerms: number;
}

export const savingsApi = {
  getProducts: async (): Promise<SavingsProduct[]> => {
    return await http.get<SavingsProduct[]>('/api/savings-products');
  },
};
