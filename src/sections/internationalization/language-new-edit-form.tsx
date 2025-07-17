'use client';

import type { ILanguage } from 'src/types/language';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { languageService } from 'src/services/language.service';

// ----------------------------------------------------------------------

export type LanguageSchemaType = zod.infer<typeof LanguageSchema>;

export const LanguageSchema = zod.object({
  code: zod.string().min(1, { message: 'Language code is required!' }).max(10, { message: 'Language code must be less than 10 characters!' }),
  name: zod.string().min(1, { message: 'Language name is required!' }),
  nativeName: zod.string().min(1, { message: 'Native name is required!' }),
  flagIcon: zod.string().optional(),
  isDefault: zod.boolean(),
  isActive: zod.boolean(),
  sortOrder: zod.number().min(0, { message: 'Sort order must be 0 or greater!' }),
});

// ----------------------------------------------------------------------

type Props = {
  currentLanguage?: ILanguage;
};

export function LanguageNewEditForm({ currentLanguage }: Props) {
  const router = useRouter();

  const defaultValues: LanguageSchemaType = {
    code: currentLanguage?.code || '',
    name: currentLanguage?.name || '',
    nativeName: currentLanguage?.nativeName || currentLanguage?.native_name || '',
    flagIcon: currentLanguage?.flagIcon || currentLanguage?.flag_icon || '',
    isDefault: currentLanguage?.isDefault || currentLanguage?.is_default || false,
    isActive: currentLanguage?.isActive !== undefined ? currentLanguage.isActive : currentLanguage?.is_active !== undefined ? currentLanguage.is_active : true,
    sortOrder: currentLanguage?.sortOrder || currentLanguage?.sort_order || 0,
  };

  const methods = useForm<LanguageSchemaType>({
    resolver: zodResolver(LanguageSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentLanguage) {
        // Update existing language
        await languageService.updateLanguage(currentLanguage.id, {
          code: data.code,
          name: data.name,
          nativeName: data.nativeName,
          flagIcon: data.flagIcon,
          isDefault: data.isDefault,
          sortOrder: data.sortOrder,
        });
      } else {
        // Create new language
        await languageService.createLanguage({
          code: data.code,
          name: data.name,
          nativeName: data.nativeName,
          flagIcon: data.flagIcon,
          isDefault: data.isDefault,
          sortOrder: data.sortOrder,
        });
        reset();
      }
      
      router.push(paths.dashboard.internationalization.root);
    } catch (error) {
      console.error('Error saving language:', error);
      // Error already handled by apiCall in languageService
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {currentLanguage ? 'Edit Language' : 'Create New Language'}
          </Typography>

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Text name="code" label="Language Code" placeholder="e.g., en, th, fr" />
            <Field.Text name="name" label="Language Name" placeholder="e.g., English, Thai, French" />
            <Field.Text name="nativeName" label="Native Name" placeholder="e.g., English, ไทย, Français" />
            <Field.Text name="flagIcon" label="Flag Icon" placeholder="e.g., 🇺🇸, 🇹🇭, 🇫🇷" />
            
            <Field.Text 
              name="sortOrder" 
              label="Sort Order" 
              type="number"
              placeholder="0"
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Field.Switch name="isActive" label="Enable" />
              <Field.Switch name="isDefault" label="Set as Default Language" />
            </Box>
          </Box>
        </Card>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => router.push(paths.dashboard.internationalization.root)}
          >
            Cancel
          </Button>
          
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {currentLanguage ? 'Update Language' : 'Create Language'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
