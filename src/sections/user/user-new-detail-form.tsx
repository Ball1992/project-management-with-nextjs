import type { IUserItem, IUser } from 'src/types/user';

import { string, z as zod } from 'zod';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Divider, IconButton, InputAdornment, Paper } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type NewUserSchemaType = zod.infer<typeof NewUserSchema>;

export const NewUserSchema = zod.object({
  avatarUrl: schemaHelper.file().optional(), // Make avatar optional
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  country: schemaHelper.nullableInput(zod.string().min(1, { message: 'Country is required!' }), {
    // message for null value
    message: 'Country is required!',
  }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  company: zod.string().min(1, { message: 'Company is required!' }),
  state: zod.string().min(1, { message: 'State is required!' }),
  city: zod.string().min(1, { message: 'City is required!' }),
  role: zod.string().min(1, { message: 'Role is required!' }),
  zipCode: zod.string().min(1, { message: 'Zip code is required!' }),
  // Not required
  status: zod.string(),
  isVerified: zod.boolean(),
  note: zod.string().optional(), // Add note field
});

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem | IUser;
};

export function UserDetailForm({ currentUser }: Props) {
  const router = useRouter();
  const showPassword = useBoolean();

  const TITLE_OPTIONS = [
    { label: 'Mr.', value: '1' },
    { label: 'Ms.', value: '2' },
    { label: 'Mrs.', value: '3' },
  ];

  const GENDER_OPTIONS = [
    { label: 'Male', value: '1' },
    { label: 'Female', value: '2' },
  ];

  const defaultValues: NewUserSchemaType = {
    status: '',
    avatarUrl: null,
    isVerified: true,
    name: '',
    email: '',
    phoneNumber: '',
    country: '',
    state: '',
    city: '',
    address: '',
    zipCode: '',
    company: '',
    role: '',
    note: '',
  };

  const methods = useForm<NewUserSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
    defaultValues,
    values: currentUser ? {
      avatarUrl: currentUser.avatarUrl || null,
      name: 'username' in currentUser ? currentUser.username : ('name' in currentUser ? currentUser.name : ''),
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || '',
      country: 'country' in currentUser ? currentUser.country : null,
      address: 'address' in currentUser ? currentUser.address : '',
      company: 'company' in currentUser ? currentUser.company : '',
      state: 'state' in currentUser ? currentUser.state : '',
      city: 'city' in currentUser ? currentUser.city : '',
      role: 'roleId' in currentUser ? currentUser.roleId : ('role' in currentUser && typeof currentUser.role === 'string' ? currentUser.role : ''),
      zipCode: 'zipCode' in currentUser ? currentUser.zipCode : '',
      status: 'isActive' in currentUser ? (currentUser.isActive ? 'active' : 'inactive') : ('status' in currentUser ? currentUser.status : 'active'),
      isVerified: 'isVerified' in currentUser ? currentUser.isVerified : true,
      note: 'note' in currentUser ? currentUser.note || '' : '', // Add note field
    } : undefined,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleBack = () => {
    router.push(paths.dashboard.user.list);
  };

  const onฺBack = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ pt: 10, pb: 5, px: 3 }}>
              {currentUser && (
                <Label
                  color={
                    (values.status === 'active' && 'success') ||
                    (values.status === 'banned' && 'error') ||
                    'warning'
                  }
                  sx={{ position: 'absolute', top: 24, right: 24 }}
                >
                  {values.status}
                </Label>
              )}

              <Box sx={{ mb: 5 }}>
                <Field.UploadAvatar
                  name="avatarUrl"
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
              </Box>

              {currentUser && (
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value !== 'active'}
                          onChange={(event) =>
                            field.onChange(event.target.checked ? 'banned' : 'active')
                          }
                        />
                      )}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Banned
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Apply disable account
                      </Typography>
                    </>
                  }
                  sx={{
                    mx: 0,
                    mb: 3,
                    width: 1,
                    justifyContent: 'space-between',
                  }}
                />
              )}

              <Field.Switch
                name="isVerified"
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Email verified
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Disabling this will automatically send the user a verification email
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />

              {currentUser && (
                <Stack sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
                  <Button variant="soft" color="error">
                    Delete user
                  </Button>
                </Stack>
              )}
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardHeader title="User Login" subheader="Please type in the user interface. In order to control the user interface to manage your website." sx={{ mb: 3 }} />
              <Divider />
              <Stack spacing={3} sx={{ p: 3 }}>
                <Field.Text name="name" label="Username" />
                <Field.Text
                  name="newPassword"
                  label="Password"
                  type={showPassword.value ? 'text' : 'password'}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={showPassword.onToggle} edge="end">
                            <Iconify
                              icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  helperText={
                    <Box component="span" sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="eva:info-fill" width={16} /> Password must be minimum 6+
                    </Box>
                  }
                />

                <Field.Text
                  name="confirmNewPassword"
                  type={showPassword.value ? 'text' : 'password'}
                  label="Confirm password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={showPassword.onToggle} edge="end">
                            <Iconify
                              icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardHeader
            title="A guide who use the system" subheader="Please enter a guide who use the system. In order to control the user interface to manage your website." sx={{ mb: 3 }}
          />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2">Antecedent</Typography>
                <Field.RadioGroup
                  row
                  name="title"
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

              <Field.Text name="firstName" label="First name" />
              <Field.Text name="lastName" label="Last name" />
              <Field.Text name="email" label="Email" />
              <Field.Text name="address" label="Address" />

              <Field.Phone
                name="phoneNumber"
                label="Tel."
                country={!currentUser ? 'TH' : undefined}
              />
              <Field.Phone
                name="phoneNumber"
                label="Mobile"
                country={!currentUser ? 'TH' : undefined}
              />

              <Field.Text name="note" label="Note" multiline rows={4} />

            </Box>
          </Stack>
        </Card>
        <Paper style={{ position: 'sticky', bottom: 10, right: 10 }}>
          <Box
            sx={{
              mt: 3,
              gap: 2,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <FormControlLabel
              label="Publish"
              control={<Switch defaultChecked inputProps={{ id: 'publish-switch' }} />}
              sx={{ pl: 3, flexGrow: 1 }}
            />

            <LoadingButton
              color="inherit"
              size="large"
              variant="outlined"
              onClick={handleBack}
            >
              Back
            </LoadingButton>
          </Box>
        </Paper>
      </Stack>
    </Form>
  );
}
