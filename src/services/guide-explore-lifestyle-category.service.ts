import axiosInstance, { endpoints } from 'src/lib/axios';
import type { 
  IGuideExploreLifestyleCategory, 
  CreateLifestyleCategoryDto, 
  UpdateLifestyleCategoryDto,
  LifestyleCategoryResponse
} from 'src/types/guide-explore-lifestyle-category';

// ----------------------------------------------------------------------

export const guideExploreLifestyleCategoryService = {
  // Get all lifestyle categories
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    lang?: string;
  }): Promise<{ data: IGuideExploreLifestyleCategory[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.guideExploreLifestyleCategory.list, { params });
    return response.data?.data || response.data;
  },

  // Get category by ID
  getCategory: async (id: number, lang?: string): Promise<IGuideExploreLifestyleCategory> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.guideExploreLifestyleCategory.detail(id), { params });
    return response.data?.data || response.data;
  },

  // Get category by code
  getCategoryByCode: async (code: string, lang?: string): Promise<IGuideExploreLifestyleCategory> => {
    const params = lang ? { lang } : undefined;
    const response = await axiosInstance.get(endpoints.guideExploreLifestyleCategory.byCode(code), { params });
    return response.data?.data || response.data;
  },

  // Create category
  createCategory: async (data: CreateLifestyleCategoryDto): Promise<LifestyleCategoryResponse> => {
    const response = await axiosInstance.post(endpoints.guideExploreLifestyleCategory.create, data);
    return response.data?.data || response.data;
  },

  // Update category
  updateCategory: async (id: number, data: UpdateLifestyleCategoryDto): Promise<LifestyleCategoryResponse> => {
    const response = await axiosInstance.patch(endpoints.guideExploreLifestyleCategory.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete category
  deleteCategory: async (id: number): Promise<void> => {
    await axiosInstance.delete(endpoints.guideExploreLifestyleCategory.delete(id));
  },
};