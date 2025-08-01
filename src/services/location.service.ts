import axiosInstance, { endpoints } from 'src/lib/axios';
import type { ILocation, CreateLocationDto, UpdateLocationDto } from 'src/types/location';

// ----------------------------------------------------------------------

export const locationService = {
  // Get all locations
  getLocations: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
  }): Promise<{ data: ILocation[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.locations.list, { params });
    return response.data?.data || response.data;
  },

  // Get location by ID
  getLocation: async (id: string, lang?: string): Promise<ILocation> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.locations.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Create location
  createLocation: async (data: CreateLocationDto): Promise<ILocation> => {
    const response = await axiosInstance.post(endpoints.locations.create, data);
    return response.data?.data || response.data;
  },

  // Update location
  updateLocation: async (id: string, data: UpdateLocationDto): Promise<ILocation> => {
    const response = await axiosInstance.patch(endpoints.locations.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete location
  deleteLocation: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.locations.delete(id));
  },

  // Get public locations (no authentication required)
  getPublicLocations: async (params?: {
    lang?: string;
  }): Promise<ILocation[]> => {
    const response = await axiosInstance.get(endpoints.locations.public, { params });
    return response.data?.data || response.data;
  },

  // Export locations
  exportLocations: async (params?: any): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.locations.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
