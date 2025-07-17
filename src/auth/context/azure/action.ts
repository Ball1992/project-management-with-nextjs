import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './msal-config';

const msalInstance = new PublicClientApplication(msalConfig);

export const signInWithAzureAD = async () => {
  try {
    const response = await msalInstance.loginPopup(loginRequest);
    return response;
  } catch (error) {
    console.error('Azure AD login error:', error);
    throw error;
  }
};

export const signInWithAzureADRedirect = async () => {
  try {
    await msalInstance.loginRedirect(loginRequest);
  } catch (error) {
    console.error('Azure AD login redirect error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await msalInstance.logoutPopup({
        account: accounts[0],
      });
    }
  } catch (error) {
    console.error('Azure AD logout error:', error);
    throw error;
  }
};

export const getAccessToken = async () => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    }
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};
