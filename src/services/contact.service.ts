import axiosInstance, { endpoints } from 'src/lib/axios';

import type { IContact, CreateContactDto, UpdateContactDto, ContactStatistics } from 'src/types/contact';

// ----------------------------------------------------------------------

export const contactService = {
  // Get all contacts - RUD (admin only)
  getContacts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: IContact[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.contact.list, { params });
    return response.data?.data || response.data;
  },

  // Get contact by ID - RUD (admin only)
  getContact: async (id: string): Promise<IContact> => {
    const response = await axiosInstance.get(endpoints.contact.detail(id));
    return response.data?.data || response.data;
  },

  // Create contact (public endpoint - for website visitors)
  createContact: async (data: CreateContactDto): Promise<IContact> => {
    const response = await axiosInstance.post(endpoints.contact.create, data);
    return response.data?.data || response.data;
  },

  // Update contact - RUD (admin only)
  updateContact: async (id: string, data: UpdateContactDto): Promise<IContact> => {
    const response = await axiosInstance.patch(endpoints.contact.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete contact - RUD (admin only)
  deleteContact: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.contact.delete(id));
  },

  // Get contact statistics - RUD (admin only)
  getStatistics: async (): Promise<ContactStatistics> => {
    const response = await axiosInstance.get(endpoints.contact.statistics);
    return response.data?.data || response.data;
  },

  // Export contacts to Excel
  exportContacts: async (params?: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.contact.export, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};
