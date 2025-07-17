import type { ILanguage, ILanguageFilters } from 'src/types/language';

import { CONFIG } from 'src/global-config';

import axios, { endpoints } from 'src/lib/axios';
import { apiCall, type ApiResponse } from 'src/utils/api-response-handler';

// ----------------------------------------------------------------------

// API Response interfaces based on OpenAPI documentation
export interface LanguageListResponse {
  responseStatus: number;
  responseMessage: string;
  data: {
    data: ILanguage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface LanguageResponse {
  responseStatus: number;
  responseMessage: string;
  data: ILanguage;
}

export interface CreateLanguageData {
  code: string;
  name: string;
  nativeName: string;
  flagIcon?: string;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface UpdateLanguageData {
  code?: string;
  name?: string;
  nativeName?: string;
  flagIcon?: string;
  isDefault?: boolean;
  sortOrder?: number;
}

export const languageService = {
  getLanguages: async (params?: { page?: number; limit?: number; search?: string }): Promise<LanguageListResponse> => {
    const URL = endpoints.language.list;
    const queryParams = {
      page: params?.page?.toString() || '1',
      limit: params?.limit?.toString() || '10',
      search: params?.search || '',
    };
    const res = await axios.get(URL, { params: queryParams });
    return res.data;
  },

  getLanguage: async (id: string): Promise<LanguageResponse> => {
    const URL = endpoints.language.details(id);
    const res = await axios.get(URL);
    return res.data;
  },

  getDefaultLanguage: async (): Promise<LanguageResponse> => {
    const URL = endpoints.language.default;
    const res = await axios.get(URL);
    return res.data;
  },

  createLanguage: async (data: CreateLanguageData): Promise<ILanguage> => {
    return apiCall(
      axios.post(endpoints.language.create, data),
      { successMessage: 'สร้างภาษาสำเร็จ' }
    );
  },

  updateLanguage: async (id: string, data: UpdateLanguageData): Promise<ILanguage> => {
    return apiCall(
      axios.patch(endpoints.language.update(id), data),
      { successMessage: 'อัปเดตภาษาสำเร็จ' }
    );
  },

  deleteLanguage: async (id: string): Promise<any> => {
    return apiCall(
      axios.delete(endpoints.language.delete(id)),
      { successMessage: 'ลบภาษาสำเร็จ' }
    );
  },

  setDefaultLanguage: async (languageId: string): Promise<any> => {
    return apiCall(
      axios.post(endpoints.language.setDefault, { languageId }),
      { successMessage: 'ตั้งค่าภาษาเริ่มต้นสำเร็จ' }
    );
  },

  exportLanguages: async (params?: any): Promise<Blob> => {
    const URL = endpoints.language.export;
    const res = await axios.get(URL, {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};

// Export default instance
export default languageService;
