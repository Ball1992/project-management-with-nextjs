import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
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
  id: string;        // Changed from menuId to id
  name: string;      // Added name field
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

// API Response format that matches your actual API
export interface ApiRoleData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  updatedBy: string;
  updatedByName: string;
  updatedDate: string;
  permissions: any[];
  Count: {
    users: number;
  };
}

export interface RoleListResponse {
  responseStatus: number;
  responseMessage: string;
  data: {
    data: ApiRoleData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface RoleResponse {
  responseStatus: number;
  responseMessage: string;
  data: ApiRoleData;
}

export interface PermissionsResponse {
  responseStatus: number;
  responseMessage: string;
  data: Permission[];
}

// Legacy interfaces for backward compatibility
export interface LegacyRoleListResponse {
  success: boolean;
  data: {
    roles: Role[];
    total: number;
    page: number;
    limit: number;
  };
  message: string;
}

export interface LegacyRoleResponse {
  success: boolean;
  data: Role;
  message: string;
}

export interface LegacyPermissionsResponse {
  success: boolean;
  data: Permission[];
  message: string;
}

// ----------------------------------------------------------------------

export class RoleService {
  // Get all roles with pagination and search
  static async getRoles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RoleListResponse> {
    const response = await axios.get(endpoints.role.list, { params });
    return response.data;
  }

  // Get role by ID
  static async getRole(id: string): Promise<RoleResponse> {
    const response = await axios.get(endpoints.role.detail(id));
    return response.data;
  }

  // Create new role
  static async createRole(data: CreateRoleData): Promise<RoleResponse> {
    const response = await axios.post(endpoints.role.create, data);
    return response.data;
  }

  // Update role
  static async updateRole(id: string, data: UpdateRoleData): Promise<RoleResponse> {
    const response = await axios.patch(endpoints.role.update(id), data);
    return response.data;
  }

  // Delete role
  static async deleteRole(id: string): Promise<{ responseStatus: number; responseMessage: string }> {
    const response = await axios.delete(endpoints.role.delete(id));
    return response.data;
  }

  // Get role permissions
  static async getRolePermissions(id: string): Promise<PermissionsResponse> {
    const response = await axios.get(endpoints.role.permissions(id));
    return response.data;
  }

  // Set role permissions
  static async setRolePermissions(id: string, data: SetPermissionsData): Promise<RoleResponse> {
    const response = await axios.post(endpoints.role.setPermissions(id), data);
    return response.data;
  }

  // Get all menus with permissions for a role
  static async getMenusWithPermissions(roleId?: string): Promise<import('src/types/role').MenuPermissionsResponse> {
    const params = roleId ? { roleId } : undefined;
    const response = await axios.get(endpoints.role.menusPermissions, { params });
    return response.data;
  }

  // Update permissions from menu structure
  static async updatePermissionsFromMenus(data: UpdateMenusPermissionsData): Promise<RoleResponse> {
    // Validate the data structure before sending
    if (!data.roleId || !Array.isArray(data.permissions)) {
      throw new Error('Invalid data structure: roleId and permissions array are required');
    }

    // Validate each permission object
    data.permissions.forEach((permission, index) => {
      if (!permission.id || !permission.name || !permission.permissions) {
        throw new Error(`Invalid permission object at index ${index}: id, name, and permissions are required`);
      }
      
      const { canView, canCreate, canUpdate, canDelete } = permission.permissions;
      if (typeof canView !== 'boolean' || typeof canCreate !== 'boolean' || 
          typeof canUpdate !== 'boolean' || typeof canDelete !== 'boolean') {
        throw new Error(`Invalid permission flags at index ${index}: all permission flags must be boolean`);
      }
    });

    console.log('Sending updatePermissionsFromMenus request:', data);
    
    const response = await axios.post(endpoints.role.updateMenusPermissions, data);
    return response.data;
  }

  // Export roles to Excel
  static async exportRoles(params?: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(endpoints.role.export, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

// Export default instance
export default RoleService;
