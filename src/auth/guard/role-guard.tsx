'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import { m } from 'framer-motion';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useAuthContext } from '../hooks';
import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export type RoleBasedGuardProp = {
  sx?: SxProps<Theme>;
  hasContent?: boolean;
  acceptRoles?: string[];
  acceptPermissions?: string[];
  requireAllPermissions?: boolean;
  children: React.ReactNode;
};

export function RoleBasedGuard({
  sx,
  children,
  hasContent,
  acceptRoles,
  acceptPermissions,
  requireAllPermissions = false,
}: RoleBasedGuardProp) {
  const { user, hasRole, hasPermission, hasAnyPermission } = useAuthContext();

  if (!user) {
    return hasContent ? (
      <Container
        component={MotionContainer}
        sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Authentication required
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            Please sign in to access this page.
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    ) : null;
  }

  // Check roles if provided
  if (acceptRoles && acceptRoles.length > 0) {
    const currentRole = user.role;
    if (!acceptRoles.includes(currentRole)) {
      return hasContent ? (
        <Container
          component={MotionContainer}
          sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
        >
          <m.div variants={varBounce('in')}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Permission denied
            </Typography>
          </m.div>

          <m.div variants={varBounce('in')}>
            <Typography sx={{ color: 'text.secondary' }}>
              You do not have the required role to access this page.
            </Typography>
          </m.div>

          <m.div variants={varBounce('in')}>
            <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
          </m.div>
        </Container>
      ) : null;
    }
  }

  // Check permissions if provided
  if (acceptPermissions && acceptPermissions.length > 0) {
    let hasRequiredPermissions = false;

    if (requireAllPermissions) {
      // User must have ALL permissions
      hasRequiredPermissions = acceptPermissions.every(permission => hasPermission(permission));
    } else {
      // User must have at least ONE permission
      hasRequiredPermissions = hasAnyPermission(acceptPermissions);
    }

    if (!hasRequiredPermissions) {
      return hasContent ? (
        <Container
          component={MotionContainer}
          sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
        >
          <m.div variants={varBounce('in')}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Permission denied
            </Typography>
          </m.div>

          <m.div variants={varBounce('in')}>
            <Typography sx={{ color: 'text.secondary' }}>
              You do not have the required permissions to access this page.
            </Typography>
          </m.div>

          <m.div variants={varBounce('in')}>
            <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
          </m.div>
        </Container>
      ) : null;
    }
  }

  return <> {children} </>;
}

// Legacy RoleGuard for backward compatibility
export function RoleGuard({ 
  children, 
  roles, 
  permissions, 
  requireAll = false,
  fallback = <div>Access Denied</div>
}: {
  children: React.ReactNode;
  roles?: string | string[];
  permissions?: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}) {
  const acceptRoles = roles ? (Array.isArray(roles) ? roles : [roles]) : undefined;
  const acceptPermissions = permissions ? (Array.isArray(permissions) ? permissions : [permissions]) : undefined;

  return (
    <RoleBasedGuard
      acceptRoles={acceptRoles}
      acceptPermissions={acceptPermissions}
      requireAllPermissions={requireAll}
      hasContent={false}
    >
      {children}
    </RoleBasedGuard>
  );
}

// Higher-order component version
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RoleBasedGuardProp, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <RoleBasedGuard {...guardProps}>
        <Component {...props} />
      </RoleBasedGuard>
    );
  };
}

// Hook for conditional rendering
export function useRoleAccess() {
  const { user, hasRole, hasPermission, hasAnyPermission } = useAuthContext();

  const canAccess = (options: {
    roles?: string | string[];
    permissions?: string | string[];
    requireAll?: boolean;
  }) => {
    if (!user) return false;

    const { roles, permissions, requireAll = false } = options;

    // Check roles
    if (roles && !hasRole(roles)) {
      return false;
    }

    // Check permissions
    if (permissions) {
      const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
      
      if (requireAll) {
        return permissionArray.every(permission => hasPermission(permission));
      } else {
        return hasAnyPermission(permissionArray);
      }
    }

    return true;
  };

  return {
    user,
    canAccess,
    hasRole,
    hasPermission,
    hasAnyPermission,
  };
}
