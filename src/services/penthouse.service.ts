import axiosInstance, { endpoints } from 'src/lib/axios';

import type { IPenthouse, CreatePenthouseDto, UpdatePenthouseDto, PenthouseStatistics } from 'src/types/penthouse';

// ----------------------------------------------------------------------

export const penthouseService = {
  // Get all penthouses/listings - CRUD
  getPenthouses: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    locationId?: string;
    propertyTypeId?: string;
  }): Promise<{ data: IPenthouse[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.penthouses.list, { params });
    return response.data?.data || response.data;
  },

  // Get penthouse/listing by ID - CRUD
  getPenthouse: async (id: string): Promise<IPenthouse> => {
    const response = await axiosInstance.get(endpoints.penthouses.detail(id));
    return response.data?.data || response.data;
  },

  // Create penthouse/listing - CRUD
  createPenthouse: async (data: CreatePenthouseDto): Promise<IPenthouse> => {
    const response = await axiosInstance.post(endpoints.penthouses.create, data);
    return response.data?.data || response.data;
  },

  // Update penthouse/listing - CRUD
  updatePenthouse: async (id: string, data: UpdatePenthouseDto): Promise<IPenthouse> => {
    const response = await axiosInstance.patch(endpoints.penthouses.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete penthouse/listing - CRUD
  deletePenthouse: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.penthouses.delete(id));
  },

  // Get penthouse/listing statistics - CRUD
  getStatistics: async (): Promise<PenthouseStatistics> => {
    const response = await axiosInstance.get(endpoints.penthouses.statistics);
    return response.data?.data || response.data;
  },

  // Upload cover image
  uploadCoverImage: async (formData: FormData): Promise<any> => {
    const response = await axiosInstance.post('/upload/cover-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export listings to Excel
  exportListings: async (params?: {
    search?: string;
    status?: string;
    location?: string;
    propertyType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.penthouses.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
