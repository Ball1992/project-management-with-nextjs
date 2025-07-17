export interface IMenu {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  url: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  updatedBy: string;
  updatedByName: string;
  updatedDate: string;
  // Support for 3-level menu hierarchy
  children?: IMenu[];
  // Legacy fields for backward compatibility
  path?: string;
  order?: number;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IMenuTableFilters {
  name: string;
  isActive: string;
  parentId: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface CreateMenuData {
  name: string;
  slug: string;
  icon?: string;
  url: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
  // Legacy fields for backward compatibility
  path?: string;
  order?: number;
  permissions?: string[];
}

export interface UpdateMenuData {
  name?: string;
  slug?: string;
  icon?: string;
  url?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  // Legacy fields for backward compatibility
  path?: string;
  order?: number;
  permissions?: string[];
}

export interface MenuListResponse {
  success: boolean;
  data: {
    menus: IMenu[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface MenuResponse {
  success: boolean;
  data: IMenu;
  message: string;
}

export interface MenuTreeResponse {
  success: boolean;
  data: IMenu[];
  message: string;
}
