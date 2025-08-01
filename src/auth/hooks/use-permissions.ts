import { useAuthContext } from './use-auth-context';

// ----------------------------------------------------------------------

export type Permission = 
  | 'users:create' | 'users:read' | 'users:update' | 'users:delete' | 'users:export'
  | 'roles:create' | 'roles:read' | 'roles:update' | 'roles:delete'
  | 'permissions:create' | 'permissions:read' | 'permissions:update' | 'permissions:delete'
  | 'content:create' | 'content:read' | 'content:update' | 'content:delete' | 'content:publish'
  | 'categories:create' | 'categories:read' | 'categories:update' | 'categories:delete'
  | 'settings:read' | 'settings:update'
  | 'audit:read' | 'notifications:read' | 'notifications:send'
  | 'dashboard:access' | 'reports:view' | 'system:admin';

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Super Admin': [
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:export',
    'roles:create', 'roles:read', 'roles:update', 'roles:delete',
    'permissions:create', 'permissions:read', 'permissions:update', 'permissions:delete',
    'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish',
    'categories:create', 'categories:read', 'categories:update', 'categories:delete',
    'settings:read', 'settings:update',
    'audit:read', 'notifications:read', 'notifications:send',
    'dashboard:access', 'reports:view', 'system:admin'
  ],
  'Admin': [
    'users:create', 'users:read', 'users:update', 'users:delete',
    'roles:read', 'roles:update',
    'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish',
    'categories:create', 'categories:read', 'categories:update', 'categories:delete',
    'settings:read', 'audit:read', 'notifications:read',
    'dashboard:access', 'reports:view'
  ],
  'Manager': [
    'users:read', 'users:update',
    'content:create', 'content:read', 'content:update', 'content:publish',
    'categories:read', 'categories:update',
    'dashboard:access', 'reports:view'
  ],
  'Editor': [
    'content:create', 'content:read', 'content:update',
    'categories:read',
    'dashboard:access'
  ],
  'Author': [
    'content:create', 'content:read', 'content:update',
    'dashboard:access'
  ],
  'Moderator': [
    'users:read', 'content:read', 'content:update',
    'dashboard:access'
  ],
  'User': [
    'dashboard:access'
  ],
  'Guest': []
};

// ----------------------------------------------------------------------

export function usePermissions() {
  const { user } = useAuthContext();

  const getUserPermissions = (): Permission[] => {
    if (!user?.role?.name) return [];
    return ROLE_PERMISSIONS[user.role.name] || [];
  };

  const hasPermission = (permission: Permission): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  };

  const canAccess = (resource: string, action: string): boolean => {
    const permission = `${resource}:${action}` as Permission;
    return hasPermission(permission);
  };

  const isAdmin = (): boolean => {
    return hasPermission('system:admin') || user?.role?.name === 'Super Admin';
  };

  const isSuperAdmin = (): boolean => {
    return user?.role?.name === 'Super Admin';
  };

  return {
    user,
    permissions: getUserPermissions(),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    isAdmin,
    isSuperAdmin,
  };
}
