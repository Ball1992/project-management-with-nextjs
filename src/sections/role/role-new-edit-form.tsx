'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useCallback, useState } from 'react';

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

import { type IRole } from 'src/types/role';
import { RoleService } from 'src/services/role.service';

// ----------------------------------------------------------------------

export type NewRoleSchemaType = zod.infer<typeof NewRoleSchema>;

export const NewRoleSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string().min(1, { message: 'Description is required!' }),
  isActive: zod.boolean(),
  isDefault: zod.boolean(),
});

// ----------------------------------------------------------------------

type Props = {
  currentRole?: IRole;
};

export function RoleNewEditForm({ currentRole }: Props) {
  const router = useRouter();

  const [loadingSave, setLoadingSave] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: currentRole?.name || '',
      description: currentRole?.description || '',
      isActive: true,
      isDefault: false,
    }),
    [currentRole]
  );

  const methods = useForm<NewRoleSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewRoleSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setLoadingSave(true);

    try {
      const roleData = {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        isDefault: data.isDefault,
      };

      if (currentRole) {
        await RoleService.updateRole(currentRole.id, roleData);
        toast.success('Role updated successfully!');
      } else {
        await RoleService.createRole(roleData);
        toast.success('Role created successfully!');
      }

      reset();
      router.push('/dashboard/roles');
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role. Please try again.');
    } finally {
      setLoadingSave(false);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <Field.Text name="name" label="Role Name" />
            <Field.Text name="description" label="Description" multiline rows={3} />
          </Box>

          <Stack spacing={3} sx={{ mt: 3 }}>
            <Typography variant="h6">Settings</Typography>
            
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch />}
                label="Enable"
                labelPlacement="start"
                sx={{ justifyContent: 'space-between', ml: 0 }}
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Default Role"
                labelPlacement="start"
                sx={{ justifyContent: 'space-between', ml: 0 }}
              />
            </Stack>
          </Stack>
        </Card>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard/roles')}
          >
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loadingSave}
          >
            {currentRole ? 'Update Role' : 'Create Role'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
