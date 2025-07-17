import axiosInstance, { endpoints } from 'src/lib/axios';

import type { IPropertyType, CreatePropertyTypeDto, UpdatePropertyTypeDto } from 'src/types/property-type';

// ----------------------------------------------------------------------

export const propertyTypeService = {
  // Get all property types - CRUD
  getPropertyTypes: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: IPropertyType[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.propertyTypes.list, { params });
    return response.data?.data || response.data;
  },

  // Get property type by ID - CRUD
  getPropertyType: async (id: string): Promise<IPropertyType> => {
    const response = await axiosInstance.get(endpoints.propertyTypes.detail(id));
    return response.data?.data || response.data;
  },

  // Create property type - CRUD
  createPropertyType: async (data: CreatePropertyTypeDto): Promise<IPropertyType> => {
    const response = await axiosInstance.post(endpoints.propertyTypes.create, data);
    return response.data?.data || response.data;
  },

  // Update property type - CRUD
  updatePropertyType: async (id: string, data: UpdatePropertyTypeDto): Promise<IPropertyType> => {
    const response = await axiosInstance.patch(endpoints.propertyTypes.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete property type - CRUD
  deletePropertyType: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.propertyTypes.delete(id));
  },

  exportPropertyTypes: async (params?: any): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.propertyTypes.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
