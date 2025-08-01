import axiosInstance, { endpoints } from 'src/lib/axios';
import type { IZone, CreateZoneDto, UpdateZoneDto } from 'src/types/zone';

// ----------------------------------------------------------------------

export const zoneService = {
  // Get all zones
  getZones: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
  }): Promise<{ data: IZone[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.zones.list, { params });
    return response.data?.data || response.data;
  },

  // Get zone by ID
  getZone: async (id: string, lang?: string): Promise<IZone> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.zones.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Create zone
  createZone: async (data: CreateZoneDto): Promise<IZone> => {
    const response = await axiosInstance.post(endpoints.zones.create, data);
    return response.data?.data || response.data;
  },

  // Update zone
  updateZone: async (id: string, data: UpdateZoneDto): Promise<IZone> => {
    const response = await axiosInstance.patch(endpoints.zones.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete zone
  deleteZone: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.zones.delete(id));
  },

  // Get public zones (no authentication required)
  getPublicZones: async (params?: {
    lang?: string;
  }): Promise<IZone[]> => {
    const response = await axiosInstance.get(endpoints.zones.public, { params });
    return response.data?.data || response.data;
  },

  // Export zones
  exportZones: async (params?: any): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.zones.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
