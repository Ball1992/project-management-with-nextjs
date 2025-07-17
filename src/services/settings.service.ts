import axios, { endpoints } from 'src/lib/axios';
import type {
  ISetting,
  UpdateSettingData,
  BulkUpdateSettingsData,
  SettingListResponse,
  SettingResponse,
  SettingsByCategoryResponse,
} from 'src/types/settings';

// ----------------------------------------------------------------------

export class SettingsService {
  // Get all settings
  static async getSettings(): Promise<SettingListResponse> {
    const response = await axios.get(endpoints.settings.list);
    return response.data;
  }

  // Get setting by key
  static async getSetting(key: string): Promise<SettingResponse> {
    const response = await axios.get(endpoints.settings.detail(key));
    return response.data;
  }

  // Update setting
  static async updateSetting(key: string, data: UpdateSettingData): Promise<SettingResponse> {
    const response = await axios.put(endpoints.settings.update(key), data);
    return response.data;
  }

  // Get settings by category
  static async getSettingsByCategory(category: string): Promise<SettingsByCategoryResponse> {
    const response = await axios.get(endpoints.settings.category(category));
    return response.data;
  }

  // Update multiple settings
  static async bulkUpdateSettings(data: BulkUpdateSettingsData): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(endpoints.settings.bulk, data);
    return response.data;
  }
}

// Export default instance
export default SettingsService;
