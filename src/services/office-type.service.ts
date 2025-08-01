import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export interface IOfficeType {
  id: string;
  name: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}

// ----------------------------------------------------------------------

export const officeTypeService = {
  // Get all office types - READ only
  getOfficeTypes: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
  }): Promise<{ data: IOfficeType[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.officeTypes.list, { params });
    return response.data?.data || response.data;
  },

  // Get office type by ID - READ only
  getOfficeType: async (id: string, lang?: string): Promise<IOfficeType> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.officeTypes.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Note: Office types are read-only in the new API structure
};
