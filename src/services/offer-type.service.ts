import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export interface IOfferType {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}

export const offerTypeService = {
  // Get all offer types (read-only)
  getOfferTypes: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
  }): Promise<{ data: IOfferType[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.offerTypes.list, { params });
    return response.data?.data || response.data;
  },

  // Get offer type by ID (read-only)
  getOfferType: async (id: string, lang?: string): Promise<IOfferType> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.offerTypes.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Note: Offer types are read-only in the new API structure
};
