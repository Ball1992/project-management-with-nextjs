import type { IPermission } from './permission';

export interface IRole {
  id: string;
  name: string;
  description?: string;
  permissions?: IPermission[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface IRoleTableFilters {
  name: string;
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

export interface SetPermissionsData {
  permissionIds: string[];
}

export interface MenuPermission {
  id: string;        // Changed from menuId to id to match backend DTO
  name: string;      // Added name field required by backend DTO
  permissions: {     // Changed from string[] to object with boolean flags
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  children?: MenuPermission[];  // Added optional children for hierarchical structure
}

export interface UpdateMenusPermissionsData {
  roleId: string;
  permissions: MenuPermission[];
}

export interface RoleListResponse {
  success: boolean;
  data: {
    roles: IRole[];
    total: number;
    page: number;
    limit: number;
  };
  message: string;
}

export interface RoleResponse {
  success: boolean;
  data: IRole;
  message: string;
}

export interface PermissionsResponse {
  success: boolean;
  data: IPermission[];
  message: string;
}

// Menu Permissions Response (matches the API example you provided)
export interface MenuPermissionsResponse {
  responseStatus: number;
  responseMessage: string;
  data: {
    data: IPermission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
