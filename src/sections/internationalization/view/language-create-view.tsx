import { DashboardContent } from 'src/layouts/dashboard';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { LanguageNewEditForm } from '../language-new-edit-form';

// ----------------------------------------------------------------------

export function LanguageCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Language"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Languages', href: paths.dashboard.internationalization.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <LanguageNewEditForm />
    </DashboardContent>
  );
}
