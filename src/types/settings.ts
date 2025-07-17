export interface ISetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISettingTableFilters {
  search: string;
  category: string;
  type: string;
  isPublic: string;
}

export interface UpdateSettingData {
  value: string;
  description?: string;
}

export interface BulkUpdateSettingsData {
  settings: {
    key: string;
    value: string;
  }[];
}

export interface SettingListResponse {
  success: boolean;
  data: {
    settings: ISetting[];
  };
  message: string;
}

export interface SettingResponse {
  success: boolean;
  data: ISetting;
  message: string;
}

export interface SettingsByCategoryResponse {
  success: boolean;
  data: {
    settings: ISetting[];
  };
  message: string;
}
