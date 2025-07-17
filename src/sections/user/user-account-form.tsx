import type { IUserItem, IUser } from 'src/types/user';

import { z as zod } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Divider, Paper } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export type AccountSchemaType = zod.infer<typeof AccountSchema>;

export const AccountSchema = zod.object({
  avatarUrl: zod.custom<File | string | null>().optional(),
  username: zod.string().optional(), // Made optional since it's read-only
  email: zod.string().optional(), // Made optional since it's read-only
  firstName: zod.string().optional(), // Made optional since it's read-only
  lastName: zod.string().optional(), // Made optional since it's read-only
  phoneNumber: zod.string().optional(), // Made optional since it's read-only
  roleId: zod.string().optional(),
  other: zod.string().optional(), // This is the note field - only editable field
  // Status fields
  isActive: zod.boolean().optional(),
  isPublic: zod.boolean().optional(),
});

// ----------------------------------------------------------------------

interface Role {
  id: string;
  name: string;
  description: string;
}

type Props = {
  currentUser?: any;
};

export function UserAccountForm({ currentUser }: Props) {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(endpoints.role.list);
        // API response structure: { responseStatus, responseMessage, data: { data: [...], pagination: {...} } }
        const rolesData = response.data?.data?.data || [];
        console.log('Roles response:', response.data);
        console.log('Roles data:', rolesData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        toast.error('Failed to load roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const defaultValues: AccountSchemaType = {
    avatarUrl: null,
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roleId: '',
    other: '',
    isActive: true,
    isPublic: false,
  };

  const methods = useForm<AccountSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(AccountSchema),
    defaultValues,
    values: currentUser ? {
      avatarUrl: currentUser.avatarUrl || null,
      username: currentUser.username || currentUser.name || '',
      email: currentUser.email || '',
      firstName: currentUser.firstName || (currentUser.name ? currentUser.name.split(' ')[0] : ''),
      lastName: currentUser.lastName || (currentUser.name ? currentUser.name.split(' ').slice(1).join(' ') : ''),
      phoneNumber: currentUser.phoneNumber || '',
      roleId: currentUser.roleId || (currentUser.role && typeof currentUser.role === 'object' ? currentUser.role.id : currentUser.role) || '',
      other: ('note' in currentUser ? currentUser.note : '') || ('other' in currentUser ? currentUser.other : '') || '', // Load existing note
      isActive: true,
      isPublic: false,
    } : undefined,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      let avatarUrl = currentUser?.avatarUrl;

      // Handle avatar upload if there's a new file
      if (data.avatarUrl && data.avatarUrl instanceof File) {
        const formData = new FormData();
        formData.append('avatar', data.avatarUrl);

        try {
          const uploadResponse = await axios.post(endpoints.account.uploadAvatar, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          // Check response status from API response format
          if (uploadResponse.data?.responseStatus >= 200 && uploadResponse.data?.responseStatus < 300) {
            if (uploadResponse.data?.data?.avatarUrl) {
              avatarUrl = uploadResponse.data.data.avatarUrl;
            }
            toast.success(uploadResponse.data?.responseMessage || 'Avatar uploaded successfully!');
          } else {
            // Handle non-2xx response status
            const errorMessage = uploadResponse.data?.responseMessage || 'Failed to upload avatar';
            toast.error(errorMessage);
            return; // Stop execution if avatar upload fails
          }
        } catch (uploadError: any) {
          console.error('Error uploading avatar:', uploadError);
          
          // Handle error response format
          const errorResponse = uploadError.response?.data;
          if (errorResponse?.responseMessage) {
            toast.error(errorResponse.responseMessage);
          } else {
            toast.error('Failed to upload avatar');
          }
          return; // Stop execution if avatar upload fails
        }
      }

      // Update profile with note
      const apiData = {
        note: data.other || '',
      };

      console.log('Updating account profile:', apiData);

      const response = await axios.put(endpoints.account.updateProfile, apiData);
      
      // Check response status from API response format
      if (response.data?.responseStatus >= 200 && response.data?.responseStatus < 300) {
        const successMessage = response.data?.responseMessage || 'Profile updated successfully!';
        toast.success(successMessage);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        // Handle non-2xx response status
        const errorMessage = response.data?.responseMessage || 'Failed to update profile';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Handle error response format
      const errorResponse = error.response?.data;
      if (errorResponse?.responseMessage) {
        toast.error(errorResponse.responseMessage);
      } else {
        toast.error('An error occurred while updating profile');
      }
    }
  });

  const handleBack = () => {
    router.push(paths.dashboard.user.list);
  };

  // Find current user's role name
  const currentUserRole = roles.find(role => role.id === values.roleId);

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
            <Label
              color={
                (values.isActive && 'success') ||
                'error'
              }
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              {values.isActive ? 'Enable' : 'Disable'}
            </Label>

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
                    color: 'text.secondary',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br />
                  Max size of {fData(3145728)}
                </Typography>
              }
            />

            {/* Display user info 
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {values.firstName} {values.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {values.email}
              </Typography>
              {currentUserRole && (
                <Typography variant="body2" color="text.secondary">
                  {currentUserRole.name}
                </Typography>
              )}
            </Box>*/}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
             

                    {/* Login Type - Based on loginMethod */}
              <Field.Select 
                name="admin@jairak.dev" 
                label="Login Type" 
                value={currentUser && 'loginMethod' in currentUser 
                  ? (currentUser.loginMethod === 'local' ? 'Local' : 'SSO (Azure AD)')
                  : 'Local'
                }
                disabled
                helperText=""
              >
                <MenuItem value="Local">Local</MenuItem>
                <MenuItem value="SSO (Azure AD)">SSO (Azure AD)</MenuItem>
              </Field.Select>
              {/* Role Display - Read Only */}
              <Field.Text 
                name="roleDisplay" 
                label="Role" 
                value={currentUserRole?.name || 'Loading...'}
                disabled
                helperText=""
              />
              <Field.Text name="firstName" label="First name" disabled />
              <Field.Text name="lastName" label="Last name" disabled />
              <Field.Text name="email" label="Email address" disabled />
              
              <Field.Phone 
                name="phoneNumber" 
                label="Mobile number"
                country="TH"
                disabled
              />
            </Box>

            <Stack spacing={3} sx={{ mt: 3 }}>
              <Field.Text name="other" multiline rows={4} label="Note" />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Paper style={{ position: 'sticky', bottom: 0, right: 0 }}>
        <Box
          sx={{
            mt: 3,
            gap: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            // p: 2,
          }}
        >
          <LoadingButton
            color="inherit"
            size="large"
            variant="outlined"
            onClick={handleBack}
          >
            Back
          </LoadingButton>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save changes
          </LoadingButton>
        </Box>
      </Paper>
    </Form>
  );
}
