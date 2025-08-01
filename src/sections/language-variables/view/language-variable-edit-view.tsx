'use client';

import type { ILanguageVariable } from 'src/types/language-variable';

import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { languageVariableService } from 'src/services/language-variable.service';

import { LanguageVariableNewEditForm } from '../language-variable-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function LanguageVariableEditView({ id }: Props) {
  const [currentLanguageVariable, setCurrentLanguageVariable] = useState<ILanguageVariable | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLanguageVariable = useCallback(async () => {
    try {
      setLoading(true);
      const response = await languageVariableService.getLanguageVariable(id);
      setCurrentLanguageVariable(response);
    } catch (error) {
      console.error('Error fetching language variable:', error);
      toast.error('Failed to fetch language variable');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchLanguageVariable();
    }
  }, [fetchLanguageVariable, id]);

  if (loading) {
    return (
      <DashboardContent>
        <div>Loading...</div>
      </DashboardContent>
    );
  }

  if (!currentLanguageVariable) {
    return (
      <DashboardContent>
        <div>Language variable not found</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit language variable"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Language Variables', href: paths.dashboard.languageVariables.root },
          { name: currentLanguageVariable.key },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <LanguageVariableNewEditForm currentLanguageVariable={currentLanguageVariable} />
    </DashboardContent>
  );
}
