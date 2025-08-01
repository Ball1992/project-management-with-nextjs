import axiosInstance, { endpoints } from 'src/lib/axios';
import type { 
  IGuideExploreFutureProject, 
  CreateFutureProjectDto, 
  UpdateFutureProjectDto,
  FutureProjectResponse
} from 'src/types/guide-explore-future-project';

// ----------------------------------------------------------------------

export const guideExploreFutureProjectService = {
  // Get all future projects
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
    locationId?: string;
    propertyTypeId?: string;
    status?: string;
  }): Promise<{ data: IGuideExploreFutureProject[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.guideExploreFutureProject.list, { params });
    return response.data?.data || response.data;
  },

  // Get project by ID
  getProject: async (id: number, lang?: string): Promise<IGuideExploreFutureProject> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.guideExploreFutureProject.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Get project by URL alias
  getProjectByUrlAlias: async (urlAlias: string, lang?: string): Promise<IGuideExploreFutureProject> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.guideExploreFutureProject.byUrlAlias(urlAlias), { params });
    return response.data?.data || response.data;
  },

  // Create project
  createProject: async (data: CreateFutureProjectDto): Promise<FutureProjectResponse> => {
    const response = await axiosInstance.post(endpoints.guideExploreFutureProject.create, data);
    return response.data?.data || response.data;
  },

  // Update project
  updateProject: async (id: number, data: UpdateFutureProjectDto): Promise<FutureProjectResponse> => {
    const response = await axiosInstance.patch(endpoints.guideExploreFutureProject.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete project
  deleteProject: async (id: number): Promise<void> => {
    await axiosInstance.delete(endpoints.guideExploreFutureProject.delete(id));
  },

  // Upload OG image
  uploadOgImage: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.guideExploreFutureProject.uploadOgImage, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload cover image
  uploadCover: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.guideExploreFutureProject.uploadCover, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload thumbnail image
  uploadThumbnail: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.guideExploreFutureProject.uploadThumbnail, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Upload logo image
  uploadLogo: async (formData: FormData): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const response = await axiosInstance.post(endpoints.guideExploreFutureProject.uploadLogo, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Generic image upload method
  uploadImage: async (formData: FormData, type: 'og-image' | 'cover' | 'thumbnail' | 'logo'): Promise<{ filename: string; path: string; size: number; mimetype: string }> => {
    const uploadEndpoints = {
      'og-image': endpoints.guideExploreFutureProject.uploadOgImage,
      'cover': endpoints.guideExploreFutureProject.uploadCover,
      'thumbnail': endpoints.guideExploreFutureProject.uploadThumbnail,
      'logo': endpoints.guideExploreFutureProject.uploadLogo,
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