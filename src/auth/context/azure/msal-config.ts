import { Configuration, LogLevel } from '@azure/msal-browser';
import { authConfig } from '../../config/auth-config';

export const msalConfig: Configuration = {
  auth: {
    clientId: authConfig.azureAd.clientId,
    authority: authConfig.azureAd.authority,
    redirectUri: authConfig.azureAd.redirectUri,
    postLogoutRedirectUri: '/',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: authConfig.azureAd.scopes,
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
