'use client';

import type { IUserItem, IUser } from 'src/types/user';

import { useEffect, useState } from 'react';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { toast } from 'src/components/snackbar';

import axios, { endpoints } from 'src/lib/axios';
import { UserNewEditForm } from '../user-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  userId: string;
};

export function UserEditView({ userId }: Props) {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(endpoints.user.detail(userId));
        const userData = response.data?.data || response.data;
        console.log('User data:', userData);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.user.list}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User Management', href: paths.dashboard.user.root },
          { name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserNewEditForm currentUser={currentUser || undefined} />
    </DashboardContent>
  );
}
