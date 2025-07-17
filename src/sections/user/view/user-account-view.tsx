'use client';

import { useEffect, useState } from 'react';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import axios, { endpoints } from 'src/lib/axios';

import { UserAccountForm } from 'src/sections/user/user-account-form';

// ----------------------------------------------------------------------

export function UserAccountView() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(endpoints.auth.me);
        console.log('Profile response:', response.data);
        
        // Check response status from API response format
        if (response.data?.responseStatus >= 200 && response.data?.responseStatus < 300) {
          // Handle API response structure: { responseStatus, responseMessage, data }
          const userData = response.data?.data || response.data;
          setCurrentUser(userData);
        } else {
          // Handle non-2xx response status
          const errorMessage = response.data?.responseMessage || 'Failed to load user profile';
          toast.error(errorMessage);
        }
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error);
        
        // Handle error response format
        const errorResponse = error.response?.data;
        if (errorResponse?.responseMessage) {
          toast.error(errorResponse.responseMessage);
        } else {
          toast.error('Failed to load user profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <DashboardContent>
        <div>Loading...</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'Account' },
        ]}
        sx={{ mb: 3 }}
      />
      <UserAccountForm currentUser={currentUser} />
    </DashboardContent>
  );
}
