'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { paths } from 'src/routes/paths';

import { setSession } from '../context/jwt/utils';

// ----------------------------------------------------------------------

export function useAuthActions() {
  const router = useRouter();

  const signIn = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.signIn, credentials);
      const { data } = response.data;

      if (data && data.accessToken) {
        // Set session จะเก็บ access token ใน sessionStorage
        await setSession(data.accessToken);
        
        // Refresh token จะถูกเก็บใน httpOnly cookie โดย server อัตโนมัติ
        
        return { success: true, user: data.user };
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Sign in failed:', error);
      throw new Error(error.response?.data?.message || 'Sign in failed');
    }
  }, []);

  const signUp = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.signUp, userData);
      const { data } = response.data;

      if (data && data.accessToken) {
        await setSession(data.accessToken);
        return { success: true, user: data.user };
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Sign up failed:', error);
      throw new Error(error.response?.data?.message || 'Sign up failed');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // เรียก logout endpoint เพื่อ clear refresh token cookie
      await axiosInstance.post('/auth/logout').catch(() => {
        // Ignore logout endpoint errors
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear access token
      await setSession(null);
      
      // Redirect to login page
      router.push(paths.auth.signIn);
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Reset password failed:', error);
      throw new Error(error.response?.data?.message || 'Reset password failed');
    }
  }, []);

  const changePassword = useCallback(async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await axiosInstance.post('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      console.error('Change password failed:', error);
      throw new Error(error.response?.data?.message || 'Change password failed');
    }
  }, []);

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    changePassword,
  };
}
