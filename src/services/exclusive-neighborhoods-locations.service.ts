import axiosInstance, { endpoints } from 'src/lib/axios';
import { CreateExclusiveNeighborhoodsLocationDto, IExclusiveNeighborhoodsLocation, UpdateExclusiveNeighborhoodsLocationDto } from 'src/types/exclusive-neighborhoods-location';

// ----------------------------------------------------------------------


export const exclusiveNeighborhoodsLocationsService = {
  // Get all locations
  getLocations: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: IExclusiveNeighborhoodsLocation[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.exclusiveNeighborhoodsLocations.list, { params });
    return response.data?.data || response.data;
  },

  // Get location by ID
  getLocation: async (id: number, lang?: string): Promise<IExclusiveNeighborhoodsLocation> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.exclusiveNeighborhoodsLocations.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Create location
  createLocation: async (data: CreateExclusiveNeighborhoodsLocationDto): Promise<IExclusiveNeighborhoodsLocation> => {
    const response = await axiosInstance.post(endpoints.exclusiveNeighborhoodsLocations.create, data);
    return response.data?.data || response.data;
  },

  // Update location
  updateLocation: async (id: number, data: UpdateExclusiveNeighborhoodsLocationDto): Promise<IExclusiveNeighborhoodsLocation> => {
    const response = await axiosInstance.patch(endpoints.exclusiveNeighborhoodsLocations.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete location
  deleteLocation: async (id: number): Promise<void> => {
    await axiosInstance.delete(endpoints.exclusiveNeighborhoodsLocations.delete(id));
  },

  // Get public locations (no authentication required)
  getPublicLocations: async (params?: {
    lang?: string;
  }): Promise<IExclusiveNeighborhoodsLocation[]> => {
    const response = await axiosInstance.get(endpoints.exclusiveNeighborhoodsLocations.public, { params });
    return response.data?.data || response.data;
  },

  // Export locations
  exportLocations: async (params?: any): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.exclusiveNeighborhoodsLocations.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
