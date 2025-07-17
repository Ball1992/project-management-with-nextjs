import type { IPermission } from 'src/types/permission';

// Interface for menu with permissions (matches your API response structure)
export interface MenuWithPermissions extends IPermission {
  permissions?: IPermission[];
  selectedPermissions?: string[];
  children?: MenuWithPermissions[];
}

// Transform flat menu permissions list into hierarchical structure
export function buildMenuPermissionsTree(menuPermissions: IPermission[]): MenuWithPermissions[] {
  const menuMap = new Map<string, MenuWithPermissions>();
  const rootMenus: MenuWithPermissions[] = [];

  // First pass: create all menu objects
  menuPermissions.forEach(menu => {
    menuMap.set(menu.id, { 
      ...menu, 
      permissions: [],
      selectedPermissions: [],
      children: [] 
    });
  });

  // Second pass: build the tree structure
  menuPermissions.forEach(menu => {
    const menuNode = menuMap.get(menu.id)!;
    
    if (!menu.parentId || menu.parentId === '') {
      // Root level menu
      rootMenus.push(menuNode);
    } else {
      // Child menu
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(menuNode);
      }
    }
  });

  // Sort by sortOrder
  const sortMenus = (menus: MenuWithPermissions[]) => {
    menus.sort((a, b) => a.sortOrder - b.sortOrder);
    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        sortMenus(menu.children);
      }
    });
  };

  sortMenus(rootMenus);
  return rootMenus;
}

// Flatten hierarchical menu structure back to flat list
export function flattenMenuPermissionsTree(menuTree: MenuWithPermissions[]): MenuWithPermissions[] {
  const flatList: MenuWithPermissions[] = [];

  const flatten = (menus: MenuWithPermissions[]) => {
    menus.forEach(menu => {
      flatList.push(menu);
      if (menu.children && menu.children.length > 0) {
        flatten(menu.children);
      }
    });
  };

  flatten(menuTree);
  return flatList;
}

// Get all menu IDs from hierarchical structure
export function getAllMenuIds(menuTree: MenuWithPermissions[]): string[] {
  const ids: string[] = [];

  const collectIds = (menus: MenuWithPermissions[]) => {
    menus.forEach(menu => {
      ids.push(menu.id);
      if (menu.children && menu.children.length > 0) {
        collectIds(menu.children);
      }
    });
  };

  collectIds(menuTree);
  return ids;
}

// Find menu by ID in hierarchical structure
export function findMenuById(menuTree: MenuWithPermissions[], menuId: string): MenuWithPermissions | null {
  for (const menu of menuTree) {
    if (menu.id === menuId) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuById(menu.children, menuId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

// Get menu path (breadcrumb) for a specific menu ID
export function getMenuPath(menuTree: MenuWithPermissions[], menuId: string): MenuWithPermissions[] {
  const path: MenuWithPermissions[] = [];

  const findPath = (menus: MenuWithPermissions[], targetId: string, currentPath: MenuWithPermissions[]): boolean => {
    for (const menu of menus) {
      const newPath = [...currentPath, menu];
      
      if (menu.id === targetId) {
        path.push(...newPath);
        return true;
      }
      
      if (menu.children && menu.children.length > 0) {
        if (findPath(menu.children, targetId, newPath)) {
          return true;
        }
      }
    }
    return false;
  };

  findPath(menuTree, menuId, []);
  return path;
}

// Count total permissions across all menus
export function countTotalPermissions(menuTree: MenuWithPermissions[]): number {
  let count = 0;

  const countPermissions = (menus: MenuWithPermissions[]) => {
    menus.forEach(menu => {
      if (menu.permissions) {
        count += menu.permissions.length;
      }
      if (menu.children && menu.children.length > 0) {
        countPermissions(menu.children);
      }
    });
  };

  countPermissions(menuTree);
  return count;
}

// Count selected permissions across all menus
export function countSelectedPermissions(menuTree: MenuWithPermissions[]): number {
  let count = 0;

  const countSelected = (menus: MenuWithPermissions[]) => {
    menus.forEach(menu => {
      if (menu.selectedPermissions) {
        count += menu.selectedPermissions.length;
      }
      if (menu.children && menu.children.length > 0) {
        countSelected(menu.children);
      }
    });
  };

  countSelected(menuTree);
  return count;
}

// Update selected permissions for a specific menu
export function updateMenuPermissions(
  menuTree: MenuWithPermissions[], 
  menuId: string, 
  selectedPermissions: string[]
): MenuWithPermissions[] {
  return menuTree.map(menu => {
    if (menu.id === menuId) {
      return {
        ...menu,
        selectedPermissions,
      };
    }
    if (menu.children && menu.children.length > 0) {
      return {
        ...menu,
        children: updateMenuPermissions(menu.children, menuId, selectedPermissions),
      };
    }
    return menu;
  });
}

// Select all permissions for all menus
export function selectAllMenuPermissions(menuTree: MenuWithPermissions[]): MenuWithPermissions[] {
  return menuTree.map(menu => ({
    ...menu,
    selectedPermissions: menu.permissions?.map(p => p.id) || [],
    children: menu.children ? selectAllMenuPermissions(menu.children) : [],
  }));
}

// Clear all selected permissions for all menus
export function clearAllMenuPermissions(menuTree: MenuWithPermissions[]): MenuWithPermissions[] {
  return menuTree.map(menu => ({
    ...menu,
    selectedPermissions: [],
    children: menu.children ? clearAllMenuPermissions(menu.children) : [],
  }));
}

// Export menu permissions data for API submission
export function exportMenuPermissionsForAPI(menuTree: MenuWithPermissions[]): Array<{
  id: string;
  name: string;
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}> {
  const result: Array<{
    id: string;
    name: string;
    permissions: {
      canView: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    };
  }> = [];

  const collectPermissions = (menus: MenuWithPermissions[]) => {
    menus.forEach(menu => {
      // Convert selected permissions array to boolean flags
      const selectedPermissions = menu.selectedPermissions || [];
      
      result.push({
        id: menu.id,
        name: menu.name,
        permissions: {
          canView: selectedPermissions.includes('canView') || selectedPermissions.some(p => p.includes('view')),
          canCreate: selectedPermissions.includes('canCreate') || selectedPermissions.some(p => p.includes('create')),
          canUpdate: selectedPermissions.includes('canUpdate') || selectedPermissions.some(p => p.includes('update')),
          canDelete: selectedPermissions.includes('canDelete') || selectedPermissions.some(p => p.includes('delete')),
        },
      });
      if (menu.children && menu.children.length > 0) {
        collectPermissions(menu.children);
      }
    });
  };

  collectPermissions(menuTree);
  return result;
}
