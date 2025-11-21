import { http } from 'tosslib';
import { SavingsProduct } from 'types/savings';

export const savingsApi = {
  getProducts: async (): Promise<SavingsProduct[]> => {
    return await http.get<SavingsProduct[]>('/api/savings-products');
  },
};
