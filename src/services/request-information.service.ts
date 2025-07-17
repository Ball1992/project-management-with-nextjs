import axiosInstance, { endpoints } from 'src/lib/axios';

import type { IRequestInformation, CreateRequestInformationDto, UpdateRequestInformationDto, RequestInformationStatistics } from 'src/types/request-information';

// ----------------------------------------------------------------------

export const requestInformationService = {
  // Get all request information - RUD (admin only)
  getRequestInformation: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: IRequestInformation[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.requestInformation.list, { params });
    return response.data?.data || response.data;
  },

  // Get request information by ID - RUD (admin only)
  getRequestInformationById: async (id: string): Promise<IRequestInformation> => {
    const response = await axiosInstance.get(endpoints.requestInformation.detail(id));
    return response.data?.data || response.data;
  },

  // Create request information (public endpoint - for website visitors)
  createRequestInformation: async (data: CreateRequestInformationDto): Promise<IRequestInformation> => {
    const response = await axiosInstance.post(endpoints.requestInformation.create, data);
    return response.data?.data || response.data;
  },

  // Update request information - RUD (admin only)
  updateRequestInformation: async (id: string, data: UpdateRequestInformationDto): Promise<IRequestInformation> => {
    const response = await axiosInstance.patch(endpoints.requestInformation.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete request information - RUD (admin only)
  deleteRequestInformation: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.requestInformation.delete(id));
  },

  // Get request information statistics - RUD (admin only)
  getStatistics: async (): Promise<RequestInformationStatistics> => {
    const response = await axiosInstance.get(endpoints.requestInformation.statistics);
    return response.data?.data || response.data;
  },

  exportRequestInformation: async (params?: any): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.requestInformation.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
