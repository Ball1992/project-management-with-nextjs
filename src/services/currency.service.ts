import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export interface ICurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_base_currency: boolean;
  is_active: boolean;
  sort_order: number;
  created_date: string;
  updated_date: string;
}

export const currencyService = {
  // Get all active currencies
  getCurrencies: async (): Promise<ICurrency[]> => {
    const response = await axiosInstance.get(endpoints.currencies.list);
    return response.data?.data || response.data;
  },

  // Get base currency
  getBaseCurrency: async (): Promise<ICurrency> => {
    const response = await axiosInstance.get(endpoints.currencies.base);
    return response.data?.data || response.data;
  },

  // Get currency by code
  getCurrencyByCode: async (code: string): Promise<ICurrency> => {
    const response = await axiosInstance.get(endpoints.currencies.byCode(code));
    return response.data?.data || response.data;
  },

  // Note: Currencies are read-only in the new API structure
};
