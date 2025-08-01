import type { ILanguageVariable, ILanguageVariableFilters, ILanguageVariableTranslation } from 'src/types/language-variable';

import axios, { endpoints } from 'src/lib/axios';
import { apiCall, type ApiResponse } from 'src/utils/api-response-handler';

// ----------------------------------------------------------------------

// API Response interfaces based on OpenAPI documentation
export interface LabelListResponse {
  responseStatus: number;
  responseMessage: string;
  data: ILanguageVariable[];
}

export interface LabelResponse {
  responseStatus: number;
  responseMessage: string;
  data: ILanguageVariable;
}

export interface LabelTranslationResponse {
  responseStatus: number;
  responseMessage: string;
  data: ILanguageVariableTranslation;
}

export interface CreateLabelData {
  key: string;
  defaultValue: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateLabelData {
  key?: string;
  defaultValue?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateLabelTranslationData {
  languageCode: string;
  value: string;
  isActive?: boolean;
}

export const languageVariableService = {
  // GET /labels - Get all labels
  getLanguageVariables: async (params?: ILanguageVariableFilters): Promise<{ data: ILanguageVariable[]; total: number }> => {
    const URL = endpoints.languageVariable.list;
    const res = await axios.get(URL, { params });
    const response = res.data as LabelListResponse;
    return {
      data: response.data,
      total: response.data.length, // API doesn't return total, so use array length
    };
  },

  // GET /labels/by-language - Get labels by language
  getLanguageVariablesByLanguage: async (languageCode: string): Promise<{ data: ILanguageVariable[]; total: number }> => {
    const URL = endpoints.languageVariable.byLanguage;
    const res = await axios.get(URL, { params: { lang: languageCode } });
    const response = res.data as LabelListResponse;
    return {
      data: response.data,
      total: response.data.length,
    };
  },

  // GET /labels/{id} - Get label by ID
  getLanguageVariable: async (id: string): Promise<ILanguageVariable> => {
    const URL = endpoints.languageVariable.details(id);
    const res = await axios.get(URL);
    const response = res.data as LabelResponse;
    return response.data;
  },

  // POST /labels - Create a new label
  createLanguageVariable: async (data: CreateLabelData): Promise<ILanguageVariable> => {
    return apiCall(
      axios.post(endpoints.languageVariable.create, data),
      { successMessage: 'สร้างตัวแปรภาษาสำเร็จ' }
    );
  },

  // PATCH /labels/{id} - Update label
  updateLanguageVariable: async (id: string, data: UpdateLabelData): Promise<ILanguageVariable> => {
    return apiCall(
      axios.patch(endpoints.languageVariable.update(id), data),
      { successMessage: 'อัปเดตตัวแปรภาษาสำเร็จ' }
    );
  },

  // DELETE /labels/{id} - Delete label
  deleteLanguageVariable: async (id: string): Promise<void> => {
    return apiCall(
      axios.delete(endpoints.languageVariable.delete(id)),
      { successMessage: 'ลบตัวแปรภาษาสำเร็จ' }
    );
  },

  // POST /labels/{id}/translations - Add translation to label
  addTranslation: async (id: string, translation: CreateLabelTranslationData): Promise<ILanguageVariableTranslation> => {
    return apiCall(
      axios.post(endpoints.languageVariable.addTranslation(id), translation),
      { successMessage: 'เพิ่มการแปลสำเร็จ' }
    );
  },

  // PATCH /labels/{id}/translations/{translationId} - Update label translation
  updateTranslation: async (labelId: string, translationId: string, data: CreateLabelTranslationData): Promise<ILanguageVariableTranslation> => {
    return apiCall(
      axios.patch(endpoints.languageVariable.updateTranslation(labelId, translationId), data),
      { successMessage: 'อัปเดตการแปลสำเร็จ' }
    );
  },

  // DELETE /labels/{id}/translations/{translationId} - Delete label translation
  deleteTranslation: async (labelId: string, translationId: string): Promise<void> => {
    return apiCall(
      axios.delete(endpoints.languageVariable.deleteTranslation(labelId, translationId)),
      { successMessage: 'ลบการแปลสำเร็จ' }
    );
  },

  // Get all translations for a label (not in API docs, but keeping for compatibility)
  getTranslations: async (id: string): Promise<ILanguageVariableTranslation[]> => {
    const URL = endpoints.languageVariable.translations(id);
    const res = await axios.get(URL);
    return res.data;
  },

  exportLanguageVariables: async (params?: any): Promise<Blob> => {
    const URL = endpoints.languageVariable.export;
    const res = await axios.get(URL, {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};
