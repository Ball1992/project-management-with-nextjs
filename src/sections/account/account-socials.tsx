'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type SocialLinksSchemaType = zod.infer<typeof SocialLinksSchema>;

export const SocialLinksSchema = zod.object({
  facebook: zod.string().optional(),
  instagram: zod.string().optional(),
  linkedin: zod.string().optional(),
  twitter: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function AccountSocials() {
  const defaultValues: SocialLinksSchemaType = {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  };

  const methods = useForm<SocialLinksSchemaType>({
    resolver: zodResolver(SocialLinksSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Social links updated!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update social links');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Field.Text
            name="facebook"
            label="Facebook"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    width={24}
                    icon="eva:facebook-fill"
                    sx={{ color: '#1877F2' }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <Field.Text
            name="instagram"
            label="Instagram"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    width={24}
                    icon="ant-design:instagram-filled"
                    sx={{ color: '#E02D69' }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <Field.Text
            name="linkedin"
            label="LinkedIn"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    width={24}
                    icon="eva:linkedin-fill"
                    sx={{ color: '#0A66C2' }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <Field.Text
            name="twitter"
            label="Twitter"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    width={24}
                    icon="eva:twitter-fill"
                    sx={{ color: '#1DA1F2' }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save Changes
          </LoadingButton>
        </Stack>
      </Card>
    </Form>
  );
}
