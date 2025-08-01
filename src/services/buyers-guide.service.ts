import axiosInstance, { endpoints } from 'src/lib/axios';
import type { 
  IBuyersGuide, 
  CreateBuyersGuideDto, 
  UpdateBuyersGuideDto,
  BuyersGuideResponse,
  BuyersGuideListResponse
} from 'src/types/buyers-guide';

// ----------------------------------------------------------------------

export const buyersGuideService = {
  // Get all buyers guides
  getGuides: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    lang?: string;
  }): Promise<BuyersGuideListResponse> => {
    const response = await axiosInstance.get(endpoints.buyersGuide.list, { params });
    return response.data?.data || response.data;
  },

  // Get published buyers guides
  getPublishedGuides: async (params?: {
    lang?: string;
  }): Promise<IBuyersGuide[]> => {
    const response = await axiosInstance.get(endpoints.buyersGuide.published, { params });
    return response.data?.data || response.data;
  },

  // Get guide by ID
  getGuide: async (id: number, lang?: string): Promise<IBuyersGuide> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.buyersGuide.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Get guide by URL alias
  getGuideByUrlAlias: async (urlAlias: string, lang?: string): Promise<IBuyersGuide> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.buyersGuide.byUrlAlias(urlAlias), { params });
    return response.data?.data || response.data;
  },

  // Create guide
  createGuide: async (data: CreateBuyersGuideDto): Promise<BuyersGuideResponse> => {
    const response = await axiosInstance.post(endpoints.buyersGuide.create, data);
    return response.data?.data || response.data;
  },

  // Update guide
  updateGuide: async (id: number, data: UpdateBuyersGuideDto): Promise<BuyersGuideResponse> => {
    const response = await axiosInstance.patch(endpoints.buyersGuide.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete guide (soft delete)
  deleteGuide: async (id: number): Promise<void> => {
    await axiosInstance.delete(endpoints.buyersGuide.delete(id));
  },

  // Upload OG image
  uploadOgImage: async (formData: FormData): Promise<{ filename: string; path: string; url: string }> => {
    const response = await axiosInstance.post(endpoints.buyersGuide.uploadOgImage, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },
};