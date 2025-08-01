'use client';

import type { ILanguage } from 'src/types/language';

import { useState, useEffect } from 'react';

import { DashboardContent } from 'src/layouts/dashboard';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { languageService } from 'src/services/language.service';

import { LanguageNewEditForm } from '../language-new-edit-form';

// ----------------------------------------------------------------------

export function LanguageEditView() {
  const params = useParams();
  const { id } = params;

  const [currentLanguage, setCurrentLanguage] = useState<ILanguage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        setLoading(true);
        const response = await languageService.getLanguage(id as string);
        
        if (response.responseStatus === 200) {
          setCurrentLanguage(response.data);
        }
      } catch (error) {
        console.error('Error fetching language:', error);
        toast.error('Failed to load language');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLanguage();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardContent>
        <div>Loading...</div>
      </DashboardContent>
    );
  }

  if (!currentLanguage) {
    return (
      <DashboardContent>
        <div>Language not found</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Language"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Languages', href: paths.dashboard.internationalization.root },
          { name: currentLanguage.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <LanguageNewEditForm currentLanguage={currentLanguage} />
    </DashboardContent>
  );
}
