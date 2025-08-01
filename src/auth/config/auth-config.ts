export type AuthMethod = 'local' | 'sso' | 'both';

export const authConfig = {
  method: (process.env.NEXT_PUBLIC_AUTH_METHOD || 'both') as AuthMethod,
  
  // Azure AD Configuration
  azureAd: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '',
    tenantId: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || '',
    redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || 'http://localhost:3001/auth/callback',
    authority: process.env.NEXT_PUBLIC_AZURE_AD_AUTHORITY || `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    scopes: ['user.read', 'openid', 'profile', 'email'],
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET || 'your-jwt-secret-key',
    expiresIn: process.env.NEXT_PUBLIC_JWT_EXPIRES_IN || '7d',
  },
  
  // Helper functions
  isLocalEnabled: () => {
    const method = authConfig.method;
    return method === 'local' || method === 'both';
  },
  
  isSSOEnabled: () => {
    const method = authConfig.method;
    return method === 'sso' || method === 'both';
  },
  
  isBothEnabled: () => {
    return authConfig.method === 'both';
  },
};
