import axios, { endpoints } from 'src/lib/axios';
import type {
  IMenu,
  CreateMenuData,
  UpdateMenuData,
  MenuListResponse,
  MenuResponse,
  MenuTreeResponse,
} from 'src/types/menu';

// ----------------------------------------------------------------------

export class MenuService {
  // Get all menus with pagination and search
  static async getMenus(params?: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MenuListResponse> {
    const response = await axios.get(endpoints.menu.list, { params });
    return response.data;
  }

  // Get menu by ID
  static async getMenu(id: string): Promise<MenuResponse> {
    const response = await axios.get(endpoints.menu.detail(id));
    return response.data;
  }

  // Create new menu
  static async createMenu(data: CreateMenuData): Promise<MenuResponse> {
    const response = await axios.post(endpoints.menu.create, data);
    return response.data;
  }

  // Update menu
  static async updateMenu(id: string, data: UpdateMenuData): Promise<MenuResponse> {
    const response = await axios.put(endpoints.menu.update(id), data);
    return response.data;
  }

  // Delete menu
  static async deleteMenu(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(endpoints.menu.delete(id));
    return response.data;
  }

  // Get menu tree
  static async getMenuTree(): Promise<MenuTreeResponse> {
    const response = await axios.get(endpoints.menu.tree);
    return response.data;
  }

  // Get navigation menu for current user
  static async getNavigationMenu(): Promise<any> {
    const response = await axios.get(endpoints.menu.tree);
    return response.data;
  }

  // Export menus to Excel
  static async exportMenus(params?: {
    search?: string;
    isActive?: boolean;
    parentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(endpoints.menu.export, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

// Export default instance
export default MenuService;
