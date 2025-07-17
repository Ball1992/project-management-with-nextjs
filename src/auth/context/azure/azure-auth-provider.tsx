'use client';

import { useMemo, useEffect, useCallback, useState } from 'react';
import { useSetState } from 'minimal-shared/hooks';
import { PublicClientApplication, EventType, AccountInfo } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { AuthContext } from '../auth-context';
import { msalConfig, loginRequest, graphConfig } from './msal-config';
import { setSession } from '../jwt/utils';

import type { AuthState } from '../../types';

// ----------------------------------------------------------------------

const msalInstance = new PublicClientApplication(msalConfig);

// Account selection logic
msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as any;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  }
});

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

function AzureAuthProviderContent({ children }: Props) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const getGraphData = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching graph data:', error);
      return null;
    }
  }, []);

  const checkUserSession = useCallback(async () => {
    try {
      if (isAuthenticated && accounts.length > 0) {
        const account = accounts[0];
        
        // Get access token
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: account,
        });

        if (response.accessToken) {
          // Get user data from Microsoft Graph
          const graphData = await getGraphData(response.accessToken);
          
          // Set session for API calls
          setSession(response.accessToken);

          // Try to get additional user data from backend
          try {
            const res = await axiosInstance.get(endpoints.auth.me);
            const { data } = res.data;
            
            setState({ 
              user: { 
                ...data, 
                ...graphData,
                accessToken: response.accessToken,
                authMethod: 'sso'
              }, 
              loading: false 
            });
          } catch (error) {
            // If backend call fails, use only Azure AD data
            setState({ 
              user: { 
                id: account.localAccountId,
                email: account.username,
                displayName: graphData?.displayName || account.name,
                firstName: graphData?.givenName,
                lastName: graphData?.surname,
                accessToken: response.accessToken,
                authMethod: 'sso',
                permissions: [],
                role: 'user'
              }, 
              loading: false 
            });
          }
        }
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Session check error:', error);
      setState({ user: null, loading: false });
    }
  }, [instance, accounts, isAuthenticated, setState, getGraphData]);

  useEffect(() => {
    checkUserSession();
  }, [isAuthenticated, accounts]);

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

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
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

export function AzureAuthProvider({ children }: Props) {
  return (
    <MsalProvider instance={msalInstance}>
      <AzureAuthProviderContent>{children}</AzureAuthProviderContent>
    </MsalProvider>
  );
}
