import axiosInstance, { endpoints } from 'src/lib/axios';
import type { IPropertyType, CreatePropertyTypeDto, UpdatePropertyTypeDto } from 'src/types/property-type';

// ----------------------------------------------------------------------

export const propertyTypeService = {
  // Get all property types
  getPropertyTypes: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
  }): Promise<{ data: IPropertyType[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.propertyTypes.list, { params });
    return response.data?.data || response.data;
  },

  // Get property type by ID
  getPropertyType: async (id: string, lang?: string): Promise<IPropertyType> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.propertyTypes.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Create property type
  createPropertyType: async (data: CreatePropertyTypeDto): Promise<IPropertyType> => {
    const response = await axiosInstance.post(endpoints.propertyTypes.create, data);
    return response.data?.data || response.data;
  },

  // Update property type
  updatePropertyType: async (id: string, data: UpdatePropertyTypeDto): Promise<IPropertyType> => {
    const response = await axiosInstance.patch(endpoints.propertyTypes.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete property type
  deletePropertyType: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.propertyTypes.delete(id));
  },

  // Get public property types (no authentication required)
  getPublicPropertyTypes: async (params?: {
    lang?: string;
  }): Promise<IPropertyType[]> => {
    const response = await axiosInstance.get(endpoints.propertyTypes.public, { params });
    return response.data?.data || response.data;
  },

  // Export property types
  exportPropertyTypes: async (params?: any): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.propertyTypes.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
