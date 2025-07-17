import axiosInstance, { endpoints } from 'src/lib/axios';

import type { IContent, CreateContentDto, UpdateContentDto, CreateContentTranslationDto } from 'src/types/content';

// ----------------------------------------------------------------------

export const contentService = {
  // Get all contents
  getContents: async (params?: {
    lang?: string;
    category?: string;
    status?: string;
  }): Promise<IContent[]> => {
    const response = await axiosInstance.get(endpoints.content.list, { params });
    return response.data?.data || response.data;
  },

  // Get content by ID
  getContent: async (id: string, lang?: string): Promise<IContent> => {
    const response = await axiosInstance.get(endpoints.content.details(id), {
      params: { lang },
    });
    return response.data?.data || response.data;
  },

  // Get content by slug (public)
  getContentBySlug: async (slug: string, lang?: string): Promise<IContent> => {
    const response = await axiosInstance.get(endpoints.content.bySlug(slug), {
      params: { lang },
    });
    return response.data?.data || response.data;
  },

  // Get published contents (public)
  getPublishedContents: async (params?: {
    lang?: string;
    category?: string;
  }): Promise<IContent[]> => {
    const response = await axiosInstance.get(endpoints.content.published, { params });
    return response.data?.data || response.data;
  },

  // Create content
  createContent: async (data: CreateContentDto): Promise<IContent> => {
    const response = await axiosInstance.post(endpoints.content.create, data);
    return response.data?.data || response.data;
  },

  // Update content
  updateContent: async (id: string, data: UpdateContentDto): Promise<IContent> => {
    const response = await axiosInstance.put(endpoints.content.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete content
  deleteContent: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.content.delete(id));
  },

  // Add or update content translation
  upsertTranslation: async (id: string, data: CreateContentTranslationDto): Promise<void> => {
    await axiosInstance.post(endpoints.content.translations(id), data);
  },
};
