'use client';

import type { IUserPermisItem } from 'src/types/user';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RoleDetailForm } from '../role-new-detail-form';

// ----------------------------------------------------------------------

type Props = {
  user?: IUserPermisItem;
  page?: 'detail' | 'edit';
};

export function RoleDetailView({ user: currentUser, page }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="ข้อมูลสิทธิ์การใช้งานระบบ"
        backHref={paths.dashboard.permis.list}
        links={[
          { name: 'แดชบอร์ด', href: paths.dashboard.root },
          { name: 'สิทธิ์การใช้งานระบบ', href: paths.dashboard.permis.root },
          { name: currentUser?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RoleDetailForm currentData={currentUser} page={page} />
    </DashboardContent>
  );
}
