import axiosInstance, { endpoints } from 'src/lib/axios';

import type { IPenthouse, CreatePenthouseDto, UpdatePenthouseDto, PenthouseStatistics } from 'src/types/penthouse';

// ----------------------------------------------------------------------

export const penthouseService = {
  // Get all penthouses/listings - CRUD
  getPenthouses: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    locationId?: string;
    propertyTypeId?: string;
    lang?: string;
  }): Promise<{ data: IPenthouse[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.penthouses.list, { params });
    return response.data?.data || response.data;
  },

  // Get penthouse/listing by ID - CRUD
  getPenthouse: async (id: string | number, lang?: string): Promise<IPenthouse> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.penthouses.detail(id.toString()), { params });
    return response.data?.data || response.data;
  },

  // Create penthouse/listing - CRUD
  createPenthouse: async (data: CreatePenthouseDto): Promise<IPenthouse> => {
    const response = await axiosInstance.post(endpoints.penthouses.create, data);
    return response.data?.data || response.data;
  },

  // Update penthouse/listing - CRUD
  updatePenthouse: async (id: string | number, data: UpdatePenthouseDto): Promise<IPenthouse> => {
    const response = await axiosInstance.patch(endpoints.penthouses.update(id.toString()), data);
    return response.data?.data || response.data;
  },

  // Delete penthouse/listing - CRUD
  deletePenthouse: async (id: string | number): Promise<void> => {
    await axiosInstance.delete(endpoints.penthouses.delete(id.toString()));
  },

  // Get penthouse/listing statistics - CRUD
  getStatistics: async (): Promise<PenthouseStatistics> => {
    const response = await axiosInstance.get(endpoints.penthouses.statistics);
    return response.data?.data || response.data;
  },

  // Upload cover image
  uploadCoverImage: async (formData: FormData): Promise<{ filename: string; originalName: string; size: number; url: string }> => {
    const response = await axiosInstance.post(`${endpoints.penthouses.list}/upload/cover-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload logo image
  uploadLogoImage: async (formData: FormData): Promise<{ filename: string; originalName: string; size: number; url: string }> => {
    const response = await axiosInstance.post(`${endpoints.penthouses.list}/upload/logo-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload thumbnail image
  uploadThumbnailImage: async (formData: FormData): Promise<{ filename: string; originalName: string; size: number; url: string }> => {
    const response = await axiosInstance.post(`${endpoints.penthouses.list}/upload/thumbnail-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload OG image
  uploadOgImage: async (formData: FormData): Promise<{ filename: string; originalName: string; size: number; url: string }> => {
    const response = await axiosInstance.post(`${endpoints.penthouses.list}/upload/og-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload gallery images
  uploadGalleryImages: async (formData: FormData): Promise<{ files: Array<{ filename: string; originalName: string; size: number; url: string }>; count: number }> => {
    const response = await axiosInstance.post(`${endpoints.penthouses.list}/upload/gallery-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload project banner
  uploadProjectBanner: async (formData: FormData): Promise<{ filename: string; originalName: string; size: number; url: string }> => {
    const response = await axiosInstance.post(`${endpoints.penthouses.list}/upload/project-banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload floor plans
  uploadFloorPlans: async (formData: FormData): Promise<{ files: Array<{ filename: string; originalName: string; size: number; url: string }>; count: number }> => {
    const response = await axiosInstance.post(`${endpoints.penthouses.list}/upload/floor-plans`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload neighborhood gallery
  uploadNeighborhoodGallery: async (formData: FormData): Promise<{ files: Array<{ filename: string; originalName: string; size: number; url: string }>; count: number }> => {
    const response = await axiosInstance.post(`${endpoints.penthouses.list}/upload/neighborhood-gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Generic image upload method
  uploadImage: async (formData: FormData, type: string): Promise<{ filename: string; originalName: string; size: number; url: string } | { files: Array<{ filename: string; originalName: string; size: number; url: string }>; count: number }> => {
    const uploadEndpoints: Record<string, string> = {
      'cover-image': `${endpoints.penthouses.list}/upload/cover-image`,
      'logo-image': `${endpoints.penthouses.list}/upload/logo-image`,
      'thumbnail-image': `${endpoints.penthouses.list}/upload/thumbnail-image`,
      'og-image': `${endpoints.penthouses.list}/upload/og-image`,
      'project-banner': `${endpoints.penthouses.list}/upload/project-banner`,
      'gallery-images': `${endpoints.penthouses.list}/upload/gallery-images`,
      'floor-plans': `${endpoints.penthouses.list}/upload/floor-plans`,
      'neighborhood-gallery': `${endpoints.penthouses.list}/upload/neighborhood-gallery`,
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

  // Publish penthouse
  publishPenthouse: async (id: string | number): Promise<IPenthouse> => {
    const response = await axiosInstance.patch(endpoints.penthouses.publish(id.toString()));
    return response.data?.data || response.data;
  },

  // Unpublish penthouse (set to draft)
  unpublishPenthouse: async (id: string | number): Promise<IPenthouse> => {
    const response = await axiosInstance.patch(endpoints.penthouses.unpublish(id.toString()));
    return response.data?.data || response.data;
  },

  // Close penthouse
  closePenthouse: async (id: string | number): Promise<IPenthouse> => {
    const response = await axiosInstance.patch(endpoints.penthouses.close(id.toString()));
    return response.data?.data || response.data;
  },

  // Export listings to Excel
  exportListings: async (params?: any): Promise<Blob> => {
    const response = await axiosInstance.get(`${endpoints.penthouses.list}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Note: Translation, price, project info, neighborhood, and gallery tour management
  // are now handled through the main penthouse create/update endpoints with nested data
  // as per the new API structure using CreatePenthouseDto and UpdatePenthouseDto
};
