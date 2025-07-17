import axiosInstance, { endpoints } from 'src/lib/axios';

import type { ILocation, CreateLocationDto, UpdateLocationDto } from 'src/types/location';

// ----------------------------------------------------------------------

export const locationService = {
  // Get all locations - CRUD
  getLocations: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: ILocation[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.locations.list, { params });
    return response.data?.data || response.data;
  },

  // Get location by ID - CRUD
  getLocation: async (id: string): Promise<ILocation> => {
    const response = await axiosInstance.get(endpoints.locations.detail(id));
    return response.data?.data || response.data;
  },

  // Create location - CRUD
  createLocation: async (data: CreateLocationDto): Promise<ILocation> => {
    const response = await axiosInstance.post(endpoints.locations.create, data);
    return response.data?.data || response.data;
  },

  // Update location - CRUD
  updateLocation: async (id: string, data: UpdateLocationDto): Promise<ILocation> => {
    const response = await axiosInstance.patch(endpoints.locations.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete location - CRUD
  deleteLocation: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.locations.delete(id));
  },

  // Export locations to Excel
  exportLocations: async (params?: {
    search?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.locations.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
