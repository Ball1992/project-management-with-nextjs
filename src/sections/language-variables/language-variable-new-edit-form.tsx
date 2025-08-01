'use client';

import type { ILanguageVariable, ILanguageVariableTranslation } from 'src/types/language-variable';
import type { ILanguage } from 'src/types/language';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { languageService } from 'src/services/language.service';
import { languageVariableService } from 'src/services/language-variable.service';

// ----------------------------------------------------------------------

export type NewLanguageVariableSchemaType = zod.infer<typeof NewLanguageVariableSchema>;

export const NewLanguageVariableSchema = zod.object({
  key: zod.string().min(1, { message: 'Key is required!' }),
  defaultValue: zod.string().min(1, { message: 'Default value is required!' }),
  description: zod.string().optional(),
  isActive: zod.boolean(),
  translations: zod.array(zod.object({
    id: zod.string().optional(),
    languageCode: zod.string(),
    value: zod.string(),
    isActive: zod.boolean(),
  })).optional(),
});

// ----------------------------------------------------------------------

type Props = {
  currentLanguageVariable?: ILanguageVariable;
};

export function LanguageVariableNewEditForm({ currentLanguageVariable }: Props) {
  const router = useRouter();

  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  const defaultValues = useMemo(
    () => ({
      key: currentLanguageVariable?.key || '',
      defaultValue: currentLanguageVariable?.defaultValue || '',
      description: currentLanguageVariable?.description || '',
      isActive: currentLanguageVariable?.isActive ?? true,
      translations: currentLanguageVariable?.translations || [],
    }),
    [currentLanguageVariable]
  );

  const methods = useForm<NewLanguageVariableSchemaType>({
    mode: 'all',
    resolver: zodResolver(NewLanguageVariableSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const fetchLanguages = useCallback(async () => {
    try {
      setLoadingLanguages(true);
      const response = await languageService.getLanguages();
      setLanguages(response.data.data);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast.error('Failed to fetch languages');
    } finally {
      setLoadingLanguages(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (currentLanguageVariable) {
      reset(defaultValues);
    }
  }, [currentLanguageVariable, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentLanguageVariable) {
        await languageVariableService.updateLanguageVariable(currentLanguageVariable.id, {
          key: data.key,
          defaultValue: data.defaultValue,
          description: data.description,
          isActive: data.isActive,
        });

        // Update translations if any
        if (data.translations && data.translations.length > 0) {
          for (const translation of data.translations) {
            if (translation.id) {
              // Update existing translation
              await languageVariableService.updateTranslation(
                currentLanguageVariable.id,
                translation.id,
                {
                  languageCode: translation.languageCode,
                  value: translation.value,
                  isActive: translation.isActive,
                }
              );
            } else {
              // Add new translation
              await languageVariableService.addTranslation(currentLanguageVariable.id, {
                languageCode: translation.languageCode,
                value: translation.value,
                isActive: translation.isActive,
              });
            }
          }
        }

        toast.success('Language variable updated successfully!');
      } else {
        const newVariable = await languageVariableService.createLanguageVariable({
          key: data.key,
          defaultValue: data.defaultValue,
          description: data.description,
          isActive: data.isActive,
        });

        // Add translations if any
        if (data.translations && data.translations.length > 0) {
          for (const translation of data.translations) {
            await languageVariableService.addTranslation(newVariable.id, {
              languageCode: translation.languageCode,
              value: translation.value,
              isActive: translation.isActive,
            });
          }
        }

        toast.success('Language variable created successfully!');
      }

      router.push(paths.dashboard.languageVariables.root);
    } catch (error) {
      console.error('Error saving language variable:', error);
      toast.error('Failed to save language variable');
    }
  });

  const handleAddTranslation = useCallback(() => {
    const currentTranslations = values.translations || [];
    setValue('translations', [
      ...currentTranslations,
      {
        languageCode: '',
        value: '',
        isActive: true,
      },
    ]);
  }, [setValue, values.translations]);

  const handleRemoveTranslation = useCallback((index: number) => {
    const currentTranslations = values.translations || [];
    setValue('translations', currentTranslations.filter((_, i) => i !== index));
  }, [setValue, values.translations]);

  const handleTranslationChange = useCallback((index: number, field: string, value: any) => {
    const currentTranslations = values.translations || [];
    const updatedTranslations = [...currentTranslations];
    updatedTranslations[index] = {
      ...updatedTranslations[index],
      [field]: value,
    };
    setValue('translations', updatedTranslations);
  }, [setValue, values.translations]);

  const renderDetails = (
    <Card>
      <CardHeader
        title="Details"
        subheader="Key, default value, and description"
        sx={{ mb: 3 }}
      />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="key" label="Key" placeholder="e.g., welcome_message" />

        <Field.Text
          name="defaultValue"
          label="Default Value"
          placeholder="Enter the default text value"
          multiline
          rows={3}
        />

        <Field.Text
          name="description"
          label="Description"
          placeholder="Optional description for this variable"
          multiline
          rows={2}
        />

        <FormControlLabel
          labelPlacement="start"
          control={
            <Switch
              checked={values.isActive}
              onChange={(event) => setValue('isActive', event.target.checked)}
            />
          }
          label={
            <>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Enable
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Enable or disable this language variable
              </Typography>
            </>
          }
          sx={{
            mx: 0,
            width: 1,
            justifyContent: 'space-between',
          }}
        />
      </Stack>
    </Card>
  );

  const renderTranslations = (
    <Card>
      <CardHeader
        title="Translations"
        subheader="Add translations for different languages"
        action={
          <Button
            size="small"
            color="primary"
            startIcon={<span>+</span>}
            onClick={handleAddTranslation}
            disabled={loadingLanguages}
          >
            Add Translation
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        {values.translations?.map((translation, index) => (
          <Card key={index} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Translation {index + 1}</Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveTranslation(index)}
                >
                  Remove
                </Button>
              </Box>

              <Field.Select
                name={`translations.${index}.languageCode`}
                label="Language"
                value={translation.languageCode || ''}
                onChange={(event) => handleTranslationChange(index, 'languageCode', event.target.value)}
              >
                <MenuItem value="">Select Language</MenuItem>
                {languages.map((language) => (
                  <MenuItem key={language.id} value={language.code}>
                    {language.name} ({language.code})
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name={`translations.${index}.value`}
                label="Translation Value"
                value={translation.value}
                onChange={(event) => handleTranslationChange(index, 'value', event.target.value)}
                multiline
                rows={2}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={translation.isActive}
                    onChange={(event) => handleTranslationChange(index, 'isActive', event.target.checked)}
                  />
                }
                label="Enable"
              />
            </Stack>
          </Card>
        ))}

        {(!values.translations || values.translations.length === 0) && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No translations added yet. Click "Add Translation" to get started.
          </Typography>
        )}
      </Stack>
    </Card>
  );

  const renderActions = (
    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
      <Button
        variant="outlined"
        size="large"
        onClick={() => router.push(paths.dashboard.languageVariables.root)}
      >
        Cancel
      </Button>

      <LoadingButton
        type="submit"
        variant="contained"
        size="large"
        loading={isSubmitting}
      >
        {currentLanguageVariable ? 'Update' : 'Create'} Language Variable
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {renderDetails}
        {renderTranslations}
        {renderActions}
      </Stack>
    </Form>
  );
}
