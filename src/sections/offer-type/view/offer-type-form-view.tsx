'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { offerTypeService } from 'src/services/offer-type.service';
import { languageService } from 'src/services/language.service';
import type { IOfferType, CreateOfferTypeDto, UpdateOfferTypeDto } from 'src/types/offer-type';
import type { ILanguage } from 'src/types/language';

// ----------------------------------------------------------------------

export type OfferTypeSchemaType = zod.infer<typeof OfferTypeSchema>;

const OfferTypeSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  code: zod.string().min(1, { message: 'Code is required!' }),
  translations: zod.array(
    zod.object({
      languageId: zod.string(),
      name: zod.string(),
    })
  ).optional(),
});

// ----------------------------------------------------------------------

type Props = {
  currentOfferType?: IOfferType;
};

export function OfferTypeFormView({ currentOfferType }: Props) {
  const router = useRouter();
  const [languages, setLanguages] = useState<ILanguage[]>([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await languageService.getLanguages({ limit: 100 });
        setLanguages(response.data.data.filter((lang: ILanguage) => lang.isActive));
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    fetchLanguages();
  }, []);

  const defaultValues = useMemo(
    () => ({
      name: currentOfferType?.name || '',
      code: currentOfferType?.code || '',
      translations: languages.map((lang) => {
        const existingTranslation = currentOfferType?.translations?.find(
          (t) => t.languageId === lang.id
        );
        return {
          languageId: lang.id,
          name: existingTranslation?.name || '',
        };
      }),
    }),
    [currentOfferType, languages]
  );

  const methods = useForm<OfferTypeSchemaType>({
    mode: 'all',
    resolver: zodResolver(OfferTypeSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentOfferType && languages.length > 0) {
      reset(defaultValues);
    }
  }, [currentOfferType, defaultValues, reset, languages]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        name: data.name,
        code: data.code,
        translations: data.translations?.filter((t) => t.name) || [],
      };

      if (currentOfferType) {
        await offerTypeService.updateOfferType(currentOfferType.id, payload as UpdateOfferTypeDto);
        toast.success('Update success!');
      } else {
        await offerTypeService.createOfferType(payload as CreateOfferTypeDto);
        toast.success('Create success!');
      }

      router.push(paths.dashboard.offerType.root);
    } catch (error) {
      console.error(error);
      toast.error(currentOfferType ? 'Failed to update offer type' : 'Failed to create offer type');
    }
  });

  const renderGeneral = (
    <Card>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Typography variant="h6">General Information</Typography>

        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        >
          <Field.Text name="name" label="Name" />
          <Field.Text name="code" label="Code" />
        </Box>
      </Stack>
    </Card>
  );

  const renderTranslations = languages.length > 0 && (
    <Card>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Typography variant="h6">Translations</Typography>

        <Grid container spacing={3}>
          {languages.map((language, index) => (
            <Grid key={language.id} size={{ xs: 12, md: 6 }}>
              <Field.Text
                name={`translations.${index}.name`}
                label={`Name (${language.name})`}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Card>
  );

  const renderActions = (
    <Stack spacing={3} direction="row" alignItems="center" flexWrap="wrap">
      <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        {!currentOfferType ? 'Create Offer Type' : 'Save Changes'}
      </LoadingButton>

      <Button variant="outlined" size="large" onClick={() => router.back()}>
        Cancel
      </Button>
    </Stack>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={!currentOfferType ? 'Create a new offer type' : 'Edit offer type'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Offer Types', href: paths.dashboard.offerType.root },
          { name: currentOfferType?.name || 'New offer type' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          {renderGeneral}
          {renderTranslations}
          {renderActions}
        </Stack>
      </Form>
    </DashboardContent>
  );
}
