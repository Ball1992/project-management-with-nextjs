import axios, { endpoints } from 'src/lib/axios';
import type {
  IPermission,
  IPermissionTree,
  CreatePermissionData,
  UpdatePermissionData,
  PermissionListResponse,
  PermissionResponse,
} from 'src/types/permission';

// ----------------------------------------------------------------------

export class PermissionService {
  // Get all permissions (menu items) - no pagination as per API documentation
  static async getPermissions(): Promise<PermissionListResponse> {
    const response = await axios.get(endpoints.permission.list);
    return response.data;
  }

  // Get permission by ID
  static async getPermission(id: string): Promise<PermissionResponse> {
    const response = await axios.get(endpoints.permission.detail(id));
    return response.data;
  }

  // Create new permission
  static async createPermission(data: CreatePermissionData): Promise<PermissionResponse> {
    const response = await axios.post(endpoints.permission.create, data);
    return response.data;
  }

  // Update permission
  static async updatePermission(id: string, data: UpdatePermissionData): Promise<PermissionResponse> {
    const response = await axios.put(endpoints.permission.update(id), data);
    return response.data;
  }

  // Delete permission
  static async deletePermission(id: string): Promise<{ responseStatus: number; responseMessage: string }> {
    const response = await axios.delete(endpoints.permission.delete(id));
    return response.data;
  }

  // Helper method to build hierarchical permission tree
  static buildPermissionTree(permissions: IPermission[]): IPermissionTree[] {
    const permissionMap = new Map<string, IPermissionTree>();
    const rootPermissions: IPermissionTree[] = [];

    // First pass: create all permission objects
    permissions.forEach(permission => {
      permissionMap.set(permission.id, { ...permission, children: [] });
    });

    // Second pass: build the tree structure
    permissions.forEach(permission => {
      const permissionNode = permissionMap.get(permission.id)!;
      
      if (!permission.parentId || permission.parentId === '') {
        // Root level permission
        rootPermissions.push(permissionNode);
      } else {
        // Child permission
        const parent = permissionMap.get(permission.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(permissionNode);
        }
      }
    });

    // Sort by sortOrder
    const sortPermissions = (perms: IPermissionTree[]) => {
      perms.sort((a, b) => a.sortOrder - b.sortOrder);
      perms.forEach(perm => {
        if (perm.children && perm.children.length > 0) {
          sortPermissions(perm.children);
        }
      });
    };

    sortPermissions(rootPermissions);
    return rootPermissions;
  }

  // Get permissions as flat list (for compatibility)
  static async getPermissionsFlat(): Promise<IPermission[]> {
    const response = await this.getPermissions();
    return response.data.data;
  }

  // Get permissions as hierarchical tree
  static async getPermissionsTree(): Promise<IPermissionTree[]> {
    const permissions = await this.getPermissionsFlat();
    return this.buildPermissionTree(permissions);
  }
}

// Export default instance
export default PermissionService;
