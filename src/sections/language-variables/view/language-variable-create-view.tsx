'use client';

import { DashboardContent } from 'src/layouts/dashboard';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { LanguageVariableNewEditForm } from '../language-variable-new-edit-form';

// ----------------------------------------------------------------------

export function LanguageVariableCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new language variable"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Language Variables', href: paths.dashboard.languageVariables.root },
          { name: 'New Language Variable' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <LanguageVariableNewEditForm />
    </DashboardContent>
  );
}
