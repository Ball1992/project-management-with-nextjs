import axiosInstance, { endpoints } from 'src/lib/axios';

import type { IOfficeType, CreateOfficeTypeDto, UpdateOfficeTypeDto, OfficeTypeStatistics } from 'src/types/office-type';

// ----------------------------------------------------------------------

export const officeTypeService = {
  // Get all office types - CRUD
  getOfficeTypes: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<{ data: IOfficeType[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.officeTypes.list, { params });
    return response.data?.data || response.data;
  },

  // Get office type by ID - CRUD
  getOfficeType: async (id: string): Promise<IOfficeType> => {
    const response = await axiosInstance.get(endpoints.officeTypes.detail(id));
    return response.data?.data || response.data;
  },

  // Create office type - CRUD
  createOfficeType: async (data: CreateOfficeTypeDto): Promise<IOfficeType> => {
    const response = await axiosInstance.post(endpoints.officeTypes.create, data);
    return response.data?.data || response.data;
  },

  // Update office type - CRUD
  updateOfficeType: async (id: string, data: UpdateOfficeTypeDto): Promise<IOfficeType> => {
    const response = await axiosInstance.patch(endpoints.officeTypes.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete office type - CRUD
  deleteOfficeType: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.officeTypes.delete(id));
  },

  // Get office type statistics - CRUD
  getStatistics: async (): Promise<OfficeTypeStatistics> => {
    const response = await axiosInstance.get(endpoints.officeTypes.statistics);
    return response.data?.data || response.data;
  },
};
