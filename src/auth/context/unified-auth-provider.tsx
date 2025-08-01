'use client';

import { authConfig } from '../config/auth-config';
import { AuthProvider as JwtAuthProvider } from './jwt/auth-provider';
import { AzureAuthProvider } from './azure/azure-auth-provider';

type Props = {
  children: React.ReactNode;
};

export function UnifiedAuthProvider({ children }: Props) {
  // If only SSO is enabled, use Azure AD provider
  if (authConfig.method === 'sso') {
    return <AzureAuthProvider>{children}</AzureAuthProvider>;
  }

  // For 'local' or 'both', use JWT provider as the base
  // The login view will handle showing both options when 'both' is selected
  return <JwtAuthProvider>{children}</JwtAuthProvider>;
}
