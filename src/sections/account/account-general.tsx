import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export type UpdateUserSchemaType = zod.infer<typeof UpdateUserSchema>;

export const UpdateUserSchema = zod.object({
  photoURL: schemaHelper.file({ message: 'Avatar is required!' }),
  username: zod.string(),
  fnamethai: zod.string().min(1, { message: 'First name in Thai is required!' }),
  lnamethai: zod.string().min(1, { message: 'Last name in Thai is required!' }),
  fnameeng: zod.string().min(1, { message: 'First name in English is required!' }),
  lnameeng: zod.string().min(1, { message: 'Last name in English is required!' }),
  prefix: zod.string().min(1, { message: 'Prefix is required!' }),
  gender: zod.string().min(1, { message: 'Gender is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  tel: zod.string().min(9, { message: 'Phone number is required!' }).max(12, { message: 'Phone number must be 10 digits!' }),
  mobile: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  position: zod.string().min(1, { message: 'Position is required!' }),
  other: zod.string().optional(),
  address: zod.string().min(1, { message: 'Address is required!' }),
  isPublic: zod.boolean().optional(),
});

// ----------------------------------------------------------------------

export function AccountGeneral() {
  const router = useRouter();
  let { user } = useAuthContext();
  // parse prefix and gender to string
  user = {
    ...user,
    // prefix: user?.prefix.toString(),
    // gender: user?.gender.toString(),
  };

  const TITLE_OPTIONS = [
    { label: 'Mr.', value: '1' },
    { label: 'Ms.', value: '2' },
    { label: 'Mrs.', value: '3' },
  ];

  const GENDER_OPTIONS = [
    { label: 'Male', value: '1' },
    { label: 'Female', value: '2' },
  ];

  const currentUser: UpdateUserSchemaType = {
    photoURL: user?.photoURL,
    username: user?.username,
    prefix: user?.prefix,
    gender: user?.gender,
    fnamethai: user?.fnamethai,
    lnamethai: user?.lnamethai,
    fnameeng: user?.fnameeng,
    lnameeng: user?.lnameeng,
    email: user?.email,
    tel: user?.telephone,
    mobile: user?.mobile,
    position: user?.position,
    other: user?.other,
    address: user?.address,
    isPublic: user?.isPublic,
  };

  const defaultValues: UpdateUserSchemaType = {
    photoURL: null,
    username: '',
    prefix: '1',
    gender: '1',
    fnamethai: '',
    lnamethai: '',
    fnameeng: '',
    lnameeng: '',
    email: '',
    tel: '',
    mobile: '',
    position: '',
    other: '',
    address: '',
    isPublic: false,
  };

  const methods = useForm<UpdateUserSchemaType>({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
    values: currentUser,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              pt: 5,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Field.UploadAvatar
              name="photoURL"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />


            <Button variant="soft" color="error" sx={{ mt: 3 }}>
              Delete user
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            {/* <Stack spacing={3} sx={{ alignItems: 'flex-end' }}>
              <Field.Text name="username" label="Username" disabled />
            </Stack> */}
            <Box
              sx={{
                mt: 3,
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2">Antecedent</Typography>
                <Field.RadioGroup
                  row
                  name="prefix"
                  options={TITLE_OPTIONS}
                  sx={{ gap: 4 }}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Sex</Typography>
                <Field.RadioGroup
                  row
                  name="gender"
                  options={GENDER_OPTIONS}
                  sx={{ gap: 4 }}
                />
              </Stack>
              <Field.Text name="fname" label="First name" />
              <Field.Text name="lname" label="Last name" />
              <Field.Text name="email" label="Email address" />
              {/* <Field.Text name="tel" label="Phone number" /> */}
              <Field.Phone name="mobile" label="Mobile number" />
              {/* <Field.Text name="position" label="Position" /> */}
            </Box>
            <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Field.Text name="note" multiline rows={4} label="Note" />
            </Stack>
            {/* <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Field.Text name="other" multiline rows={4} label="Other" />
            </Stack> */}
          </Card>
        </Grid>
      </Grid>
      <Paper style={{ position: 'sticky', bottom: 10, right: 10 }}>
        <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save changes
          </LoadingButton>
        </Stack>
      </Paper>
    </Form>
  );
}
