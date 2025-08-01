import axiosInstance, { endpoints } from 'src/lib/axios';
import type { 
  IGuideExploreLifestyleListing, 
  CreateLifestyleListingDto, 
  UpdateLifestyleListingDto,
  LifestyleListingResponse
} from 'src/types/guide-explore-lifestyle-listing';

// ----------------------------------------------------------------------

export const guideExploreLifestyleListingService = {
  // Get all lifestyle listings
  getListings: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
    categoryId?: number;
    status?: string;
  }): Promise<{ data: IGuideExploreLifestyleListing[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.guideExploreLifestyleListing.list, { params });
    return response.data?.data || response.data;
  },

  // Get listing by ID
  getListing: async (id: number, lang?: string): Promise<IGuideExploreLifestyleListing> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.guideExploreLifestyleListing.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Get listing by URL alias
  getListingByUrlAlias: async (urlAlias: string, lang?: string): Promise<IGuideExploreLifestyleListing> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.guideExploreLifestyleListing.byUrlAlias(urlAlias), { params });
    return response.data?.data || response.data;
  },

  // Create listing
  createListing: async (data: CreateLifestyleListingDto): Promise<LifestyleListingResponse> => {
    const response = await axiosInstance.post(endpoints.guideExploreLifestyleListing.create, data);
    return response.data?.data || response.data;
  },

  // Update listing
  updateListing: async (id: number, data: UpdateLifestyleListingDto): Promise<LifestyleListingResponse> => {
    const response = await axiosInstance.patch(endpoints.guideExploreLifestyleListing.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete listing
  deleteListing: async (id: number): Promise<void> => {
    await axiosInstance.delete(endpoints.guideExploreLifestyleListing.delete(id));
  },

  // Upload OG image
  uploadOgImage: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.guideExploreLifestyleListing.uploadOgImage, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload cover image
  uploadCover: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.guideExploreLifestyleListing.uploadCover, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload thumbnail image
  uploadThumbnail: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.guideExploreLifestyleListing.uploadThumbnail, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Generic image upload method
  uploadImage: async (formData: FormData, type: 'og-image' | 'cover' | 'thumbnail'): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const uploadEndpoints = {
      'og-image': endpoints.guideExploreLifestyleListing.uploadOgImage,
      'cover': endpoints.guideExploreLifestyleListing.uploadCover,
      'thumbnail': endpoints.guideExploreLifestyleListing.uploadThumbnail,
    };

    const endpoint = uploadEndpoints[type];
    if (!endpoint) {
      throw new Error(`Unknown upload type: ${type}`);
    }

    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },
};