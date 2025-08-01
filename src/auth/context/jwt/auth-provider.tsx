'use client';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken, refreshTokenRequest } from './utils';

import type { AuthState } from '../../types';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axiosInstance.get(endpoints.auth.me);

        const { data } = res.data;
   
        setState({ user: { ...data, accessToken, authMethod: 'local' }, loading: false });
      
      } else {
        // Try to refresh token if access token is invalid or missing
        try {
          const newToken = await refreshTokenRequest();
          if (newToken) {
            setSession(newToken);
            
            const res = await axiosInstance.get(endpoints.auth.me);
            const { data } = res.data;
            
            setState({ user: { ...data, accessToken: newToken, authMethod: 'local' }, loading: false });
          } else {
            setState({ user: null, loading: false });
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          setState({ user: null, loading: false });
        }
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------
  
  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  // Permission checking functions
  const hasPermission = useCallback((permission: string) => {
    if (!state.user || !state.user.permissions) return false;
    return state.user.permissions.includes(permission);
  }, [state.user]);

  const hasRole = useCallback((role: string | string[]) => {
    if (!state.user) return false;
    const userRole = state.user.role;
    const allowedRoles = Array.isArray(role) ? role : [role];
    return allowedRoles.includes(userRole);
  }, [state.user]);

  const hasAnyPermission = useCallback((permissions: string[]) => {
    if (!state.user || !state.user.permissions) return false;
    return permissions.some(permission => state.user!.permissions.includes(permission));
  }, [state.user]);

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      hasPermission,
      hasRole,
      hasAnyPermission,
    }),
    [checkUserSession, state.user, status, hasPermission, hasRole, hasAnyPermission]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
