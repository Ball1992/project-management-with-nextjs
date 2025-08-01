'use client';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    const res = await axiosInstance.post(endpoints.auth.signIn, params);

    // Handle the original API response format: {responseStatus, responseMessage, data}
    const responseData = res.data;
    
    if (responseData.responseStatus !== 201) {
      throw new Error(responseData.responseMessage || 'Login failed');
    }

    // Extract access token from the response data
    const { accessToken } = responseData.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }
    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axiosInstance.post(endpoints.auth.signUp, params);

    // Handle thailandpenthouses-api response format
    const responseData = res.data;
    
    if (responseData.responseStatus !== 201) {
      throw new Error(responseData.responseMessage || 'Registration failed');
    }

    const { accessToken } = responseData.data.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};


/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
