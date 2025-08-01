import axiosInstance, { endpoints } from 'src/lib/axios';
import type { 
  IExclusiveNeighborhoodListing, 
  CreateNeighborhoodListingDto, 
  UpdateNeighborhoodListingDto,
  NeighborhoodListingResponse
} from 'src/types/exclusive-neighborhoods-listings';

// ----------------------------------------------------------------------

export const exclusiveNeighborhoodsListingsService = {
  // Get all neighborhood listings
  getListings: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
    locationId?: number;
    status?: string;
  }): Promise<{ data: IExclusiveNeighborhoodListing[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.exclusiveNeighborhoodsListings.list, { params });
    return response.data?.data || response.data;
  },

  // Get listing by ID
  getListing: async (id: number, lang?: string): Promise<IExclusiveNeighborhoodListing> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.exclusiveNeighborhoodsListings.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Create listing
  createListing: async (data: CreateNeighborhoodListingDto): Promise<NeighborhoodListingResponse> => {
    const response = await axiosInstance.post(endpoints.exclusiveNeighborhoodsListings.create, data);
    return response.data?.data || response.data;
  },

  // Update listing
  updateListing: async (id: number, data: UpdateNeighborhoodListingDto): Promise<NeighborhoodListingResponse> => {
    const response = await axiosInstance.patch(endpoints.exclusiveNeighborhoodsListings.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete listing
  deleteListing: async (id: number): Promise<void> => {
    await axiosInstance.delete(endpoints.exclusiveNeighborhoodsListings.delete(id));
  },

  // Upload OG image
  uploadOgImage: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.exclusiveNeighborhoodsListings.uploadOgImage, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload cover image
  uploadCover: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.exclusiveNeighborhoodsListings.uploadCover, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload thumbnail image
  uploadThumbnail: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.exclusiveNeighborhoodsListings.uploadThumbnail, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Generic image upload method
  uploadImage: async (formData: FormData, type: 'og-image' | 'cover' | 'thumbnail'): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const uploadEndpoints = {
      'og-image': endpoints.exclusiveNeighborhoodsListings.uploadOgImage,
      'cover': endpoints.exclusiveNeighborhoodsListings.uploadCover,
      'thumbnail': endpoints.exclusiveNeighborhoodsListings.uploadThumbnail,
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