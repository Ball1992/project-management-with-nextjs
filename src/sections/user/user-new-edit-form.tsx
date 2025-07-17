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

import { UserService } from 'src/services/user.service';
import axios, { endpoints } from 'src/lib/axios';
import { apiCall } from 'src/utils/api-response-handler';

// ----------------------------------------------------------------------

export type NewUserSchemaType = zod.infer<typeof NewUserSchema>;

export const NewUserSchema = zod.object({
  avatarUrl: schemaHelper.file().optional(),
  username: zod.string().min(1, { message: 'Username is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  roleId: zod.string().min(1, { message: 'Role is required!' }),
  other: zod.string().optional(),
  // Status fields
  isActive: zod.boolean(),
  isPublic: zod.boolean().optional(),
});

// ----------------------------------------------------------------------

interface Role {
  id: string;
  name: string;
  description: string;
}

type Props = {
  currentUser?: IUserItem | IUser;
};

export function UserNewEditForm({ currentUser }: Props) {
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

  const defaultValues: NewUserSchemaType = {
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

  const methods = useForm<NewUserSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
    defaultValues,
    values: currentUser ? {
      avatarUrl: currentUser.avatarUrl || null,
      username: 'username' in currentUser ? currentUser.username : ('name' in currentUser ? currentUser.name : ''),
      email: currentUser.email || '',
      firstName: 'firstName' in currentUser ? currentUser.firstName : ('name' in currentUser ? currentUser.name?.split(' ')[0] || '' : ''),
      lastName: 'lastName' in currentUser ? currentUser.lastName : ('name' in currentUser ? currentUser.name?.split(' ')[1] || '' : ''),
      phoneNumber: currentUser.phoneNumber || '',
      roleId: 'roleId' in currentUser ? currentUser.roleId : ('role' in currentUser && typeof currentUser.role === 'string' ? currentUser.role : ''),
      other: 'note' in currentUser ? currentUser.note || '' : '', // Load existing note
      isActive: 'isActive' in currentUser ? currentUser.isActive : ('status' in currentUser ? currentUser.status === 'active' : true),
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
      let finalAvatarUrl = '';
      
      // Handle avatar upload logic
      if (data.avatarUrl && typeof data.avatarUrl !== 'string') {
        // New file selected - upload it
        try {
          const formData = new FormData();
          formData.append('avatar', data.avatarUrl);
          
          const avatarPath = await apiCall(
            axios.post(endpoints.user.uploadAvatar, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }),
            { showSuccessToast: false }
          );
          
          finalAvatarUrl = avatarPath?.avatar_path || '';
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          return; // Error already handled by apiCall
        }
      } else if (currentUser && typeof data.avatarUrl === 'string') {
        // Keep existing avatar (it's already a string URL)
        finalAvatarUrl = data.avatarUrl;
      } else if (currentUser && !data.avatarUrl) {
        // No avatar selected, keep the current user's avatar
        finalAvatarUrl = currentUser.avatarUrl || '';
      }
      // For new users without avatar, finalAvatarUrl remains empty string

      // Prepare data for API according to CreateUserDto/UpdateUserDto
      const apiData = {
        email: data.email,
        username: data.username,
        password: '123456', // Fixed password as requested
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        avatarUrl: finalAvatarUrl,
        roleId: data.roleId,
        note: data.other || '', // Add note field to API data
      };

      if (currentUser) {
        // Update existing user
        await UserService.updateUser(currentUser.id, apiData);
      } else {
        // Create new user
        await UserService.createUser(apiData);
      }
      
      reset();
      router.push(paths.dashboard.user.list);
    } catch (error: any) {
      console.error('Error saving user:', error);
      // Error already handled by apiCall in UserService
    }
  });

  const handleBack = () => {
    router.push(paths.dashboard.user.list);
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    
    try {
      await UserService.deleteUser(currentUser.id);
      router.push(paths.dashboard.user.list);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      // Error already handled by apiCall in UserService
    }
  };

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
            {currentUser && (
              <Label
                color={
                  (values.isActive && 'success') ||
                  'error'
                }
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.isActive ? 'Enable' : 'Disable'}
              </Label>
            )}

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


            {currentUser && (
              <Button 
                variant="soft" 
                color="error" 
                sx={{ mt: 3 }}
                onClick={handleDelete}
              >
                Delete user
              </Button>
            )}
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
                name="userType" 
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
 {/* Role Selection */}
              <Field.Select name="roleId" label="Role" disabled={loadingRoles}>
                {loadingRoles ? (
                  <MenuItem value="" disabled>
                    Loading roles...
                  </MenuItem>
                ) : Array.isArray(roles) && roles.length > 0 ? (
                  roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No roles available
                  </MenuItem>
                )}
              </Field.Select>
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

      <Paper style={{ position: 'sticky', bottom: 10, right: 10 }}>
        <Box
          sx={{
            mt: 3,
            gap: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
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
            {!currentUser ? 'Create User' : 'Save changes'}
          </LoadingButton>
        </Box>
      </Paper>
    </Form>
  );
}
