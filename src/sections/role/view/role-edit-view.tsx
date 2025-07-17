'use client';

import type { IRole } from 'src/types/role';
import type { IPermission } from 'src/types/permission';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import { Form, Field } from 'src/components/hook-form';

import { RoleService } from 'src/services/role.service';
import { PermissionService } from 'src/services/permission.service';
import { fDate } from 'src/utils/format-time';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export const RoleSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string().optional(),
});

export type RoleSchemaType = zod.infer<typeof RoleSchema>;

// ----------------------------------------------------------------------

interface MenuWithPermissions {
  id: string;
  name: string;
  slug: string;
  url: string;
  icon: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
  permissions?: {
    canView?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  children?: MenuWithPermissions[];
}

export function RoleEditView() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<IRole | null>(null);
  const [allPermissions, setAllPermissions] = useState<IPermission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [menusWithPermissions, setMenusWithPermissions] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [savingMenuPermissions, setSavingMenuPermissions] = useState(false);

  const defaultValues: RoleSchemaType = {
    name: '',
    description: '',
  };

  const methods = useForm<RoleSchemaType>({
    resolver: zodResolver(RoleSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const fetchRoleData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch role details
      const roleResponse = await RoleService.getRole(roleId);
      if (roleResponse.responseStatus === 200) {
        const roleData = roleResponse.data;
        setRole({
          id: roleData.id,
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions || [],
          userCount: roleData.Count?.users || 0,
          createdAt: roleData.createdDate,
          updatedAt: roleData.updatedDate,
          createdBy: roleData.createdBy,
          updatedBy: roleData.updatedBy,
        });

        reset({
          name: roleData.name,
          description: roleData.description || '',
        });

        setSelectedPermissions(roleData.permissions?.map((p: any) => p.id) || []);
      }

      // Fetch all permissions using PermissionService
      try {
        const permissionsResponse = await PermissionService.getPermissions();
        if (permissionsResponse.responseStatus === 200) {
          setAllPermissions(permissionsResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }

      // Fetch menus with permissions
      const menusResponse = await RoleService.getMenusWithPermissions(roleId);
      if (menusResponse.responseStatus === 200) {
        setMenusWithPermissions(menusResponse.data.data || []);
      }

    } catch (error) {
      console.error('Error fetching role data:', error);
      toast.error('Failed to fetch role data');
    } finally {
      setLoading(false);
    }
  }, [roleId, reset]);

  useEffect(() => {
    if (roleId) {
      fetchRoleData();
    }
  }, [fetchRoleData, roleId]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Update role basic info
      const updateResponse = await RoleService.updateRole(roleId, {
        name: data.name,
        description: data.description,
      });

      if (updateResponse.responseStatus === 200) {
        // Update permissions
        const permissionsResponse = await RoleService.setRolePermissions(roleId, {
          permissionIds: selectedPermissions,
        });

        if (permissionsResponse.responseStatus === 200) {
          toast.success('Role updated successfully!');
          router.push(paths.dashboard.roles.list);
        } else {
          toast.error('Failed to update permissions');
        }
      } else {
        toast.error(updateResponse.responseMessage || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  });

  const handlePermissionChange = useCallback((permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        return [...prev, permissionId];
      } else {
        return prev.filter(id => id !== permissionId);
      }
    });
  }, []);

  const handleMenuPermissionChange = useCallback((menuId: string, permissionKey: string, checked: boolean) => {
    setMenusWithPermissions(prev => {
      // Check if prev is an array
      if (!Array.isArray(prev)) {
        console.error('menusWithPermissions is not an array in handleMenuPermissionChange:', prev);
        return [];
      }
      
      return prev.map(menu => {
        if (menu.id === menuId) {
          // Handle new permissions structure (object with boolean flags)
          if (menu.permissions && typeof menu.permissions === 'object' && !Array.isArray(menu.permissions)) {
            return {
              ...menu,
              permissions: {
                ...menu.permissions,
                [permissionKey]: checked,
              },
            };
          }
          // Handle legacy permissions structure (array with selectedPermissions)
          else {
            const updatedPermissions = checked
              ? [...(menu.selectedPermissions || []), permissionKey]
              : (menu.selectedPermissions || []).filter((id: string) => id !== permissionKey);
            
            return {
              ...menu,
              selectedPermissions: updatedPermissions,
            };
          }
        }
        return menu;
      });
    });
  }, []);

  const handleSaveMenuPermissions = useCallback(async () => {
    try {
      setSavingMenuPermissions(true);
      


      const response = await RoleService.updatePermissionsFromMenus({
        roleId,
        permissions: menusWithPermissions,
      });

      if (response.responseStatus === 200) {
        toast.success('Menu permissions updated successfully!');
        fetchRoleData(); // Refresh data
      } else {
        toast.error(response.responseMessage || 'Failed to update menu permissions');
      }
    } catch (error) {
      console.error('Error updating menu permissions:', error);
      toast.error('Failed to update menu permissions');
    } finally {
      setSavingMenuPermissions(false);
    }
  }, [menusWithPermissions, roleId, fetchRoleData]);

  // Build hierarchical menu tree
  const buildMenuTree = useCallback((parentId: string = ''): MenuWithPermissions[] => {
    return menusWithPermissions
      .filter(menu => (menu.parentId || '') === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(menu => ({
        ...menu,
        children: buildMenuTree(menu.id)
      }));
  }, [menusWithPermissions]);

  // Render menu tree recursively
  const renderMenuTree = useCallback((menus: MenuWithPermissions[], level: number = 0): JSX.Element[] => {
    return menus.map((menu) => (
      <Accordion key={menu.id} defaultExpanded={level === 0}>
        <AccordionSummary
          expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          sx={{ 
            bgcolor: level === 0 ? 'primary.lighter' : 'grey.50',
            '&:hover': { bgcolor: level === 0 ? 'primary.light' : 'grey.100' }
          }}
        >
          <Box display="flex" alignItems="center" width="100%">
            <Box display="flex" alignItems="center" flex={1}>
              <Iconify 
                icon={menu.icon || 'eva:menu-2-fill'} 
                sx={{ mr: 1, color: level === 0 ? 'primary.main' : 'text.secondary' }} 
              />
              <Typography 
                variant={level === 0 ? 'subtitle1' : 'body2'} 
                fontWeight={level === 0 ? 'bold' : 'medium'}
              >
                {menu.name}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={`${Object.values(menu.permissions || {}).filter(Boolean).length}/4`}
                size="small"
                color={
                  Object.values(menu.permissions || {}).filter(Boolean).length === 4
                    ? 'success'
                    : Object.values(menu.permissions || {}).filter(Boolean).length > 0
                    ? 'warning'
                    : 'default'
                }
              />
              {menu.isActive && (
                <Chip label="Enable" size="small" color="success" variant="outlined" />
              )}
            </Box>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          <Stack spacing={2}>
            {menu.url && (
              <Typography variant="caption" color="text.secondary">
                URL: {menu.url}
              </Typography>
            )}
            
            {/* CRUD Permissions for this menu */}
            <Box>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                Permissions:
              </Typography>
              <Grid container spacing={1}>
                {['canView', 'canCreate', 'canUpdate', 'canDelete'].map((permissionKey) => {
                  const hasPermission = menu.permissions && 
                    typeof menu.permissions === 'object' && 
                    !Array.isArray(menu.permissions) ? 
                    Boolean(menu.permissions[permissionKey as keyof typeof menu.permissions]) : false;
                  
                  const permissionLabel = permissionKey.replace('can', '');
                  
                  return (
                    <Grid item xs={6} sm={3} key={permissionKey}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={hasPermission}
                            onChange={(e) => 
                              handleMenuPermissionChange(menu.id, permissionKey, e.target.checked)
                            }
                          />
                        }
                        label={
                          <Chip
                            label={permissionLabel}
                            size="small"
                            variant="outlined"
                            color={hasPermission ? 'primary' : 'default'}
                            sx={{ fontSize: '0.75rem' }}
                          />
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
            
            {/* Render child menus */}
            {menu.children && menu.children.length > 0 && (
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Sub-menus:
                </Typography>
                <Stack spacing={1}>
                  {renderMenuTree(menu.children, level + 1)}
                </Stack>
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    ));
  }, [handleMenuPermissionChange]);

  if (loading) {
    return (
      <DashboardContent>
        <LoadingScreen />
      </DashboardContent>
    );
  }

  if (!role) {
    return (
      <DashboardContent>
        <Typography variant="h6">Role not found</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Role"
        links={[
          { name: 'Administration Panel' },
          { name: 'Roles', href: paths.dashboard.roles.list },
          { name: role.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">Basic Information</Typography>
                
                <Field.Text name="name" label="Role Name" />
                
                <Field.Text
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                />

                <Stack direction="row" spacing={2}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                    startIcon={<Iconify icon="eva:save-fill" />}
                  >
                    Save Changes
                  </LoadingButton>
                  
                  <Button
                    variant="outlined"
                    onClick={() => router.push(paths.dashboard.roles.list)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Role Statistics</Typography>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Users with this role
                  </Typography>
                  <Typography variant="h4">
                    {role.userCount || 0}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Permissions assigned
                  </Typography>
                  <Typography variant="h4">
                    {selectedPermissions.length}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created by
                  </Typography>
                  <Typography variant="body1">
                    {role.createdBy || 'System'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created date
                  </Typography>
                  <Typography variant="body1">
                    {fDate(role.createdAt, 'DD/MM/YYYY')}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Comprehensive Permissions Management Section */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">Permissions Management</Typography>
                
                <Tabs
                  value={currentTab}
                  onChange={(event, newValue) => setCurrentTab(newValue)}
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="All Permissions" />
                  <Tab label="Menu Permissions" />
                </Tabs>

                {/* All Permissions Tab */}
                {currentTab === 0 && (
                  <Stack spacing={3}>
                    <TextField
                      placeholder="Search permissions..."
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ maxWidth: 400 }}
                    />

                    {allPermissions.length > 0 ? (
                      <Stack spacing={2}>
                        {/* Group permissions by parent */}
                        {Object.entries(
                          allPermissions
                            .filter(permission => 
                              !permissionSearch || 
                              permission.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                              permission.slug.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                              permission.url.toLowerCase().includes(permissionSearch.toLowerCase())
                            )
                            .reduce((acc, permission) => {
                              const parentGroup = permission.parentId || 'Root Level';
                              if (!acc[parentGroup]) {
                                acc[parentGroup] = [];
                              }
                              acc[parentGroup].push(permission);
                              return acc;
                            }, {} as Record<string, IPermission[]>)
                        ).map(([parentGroup, permissions]) => (
                          <Accordion key={parentGroup} defaultExpanded>
                            <AccordionSummary
                              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                            >
                              <Typography variant="subtitle1" fontWeight="bold">
                                
                                {parentGroup === 'Root Level' ? 'Main Menu Items' : 
                                 allPermissions.find(p => p.id === parentGroup)?.name || parentGroup} ({permissions.length})
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={2}>
                                {permissions.map((permission) => (
                                  <Grid item xs={12} sm={6} md={4} key={permission.id}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={selectedPermissions.includes(permission.id)}
                                          onChange={(e) => 
                                            handlePermissionChange(permission.id, e.target.checked)
                                          }
                                        />
                                      }
                                      label={
                                        <Box>
                                          <Typography variant="body2" fontWeight="medium">
                                            {permission.name}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {permission.url || permission.slug}
                                          </Typography>
                                          <Typography variant="caption" display="block" color="text.secondary">
                                            {permission.isActive ? 'Enable' : 'Disable'} • Order: {permission.sortOrder}
                                          </Typography>
                                        </Box>
                                      }
                                      sx={{ 
                                        alignItems: 'flex-start',
                                        border: 1,
                                        borderColor: selectedPermissions.includes(permission.id) ? 'primary.main' : 'divider',
                                        borderRadius: 1,
                                        p: 1,
                                        m: 0,
                                        width: '100%',
                                        bgcolor: selectedPermissions.includes(permission.id) ? 'primary.lighter' : 'transparent',
                                        '&:hover': {
                                          bgcolor: selectedPermissions.includes(permission.id) ? 'primary.lighter' : 'action.hover',
                                        }
                                      }}
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                        No permissions available
                      </Typography>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {selectedPermissions.length} permissions selected
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          onClick={() => setSelectedPermissions([])}
                          disabled={selectedPermissions.length === 0}
                        >
                          Clear All
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setSelectedPermissions(allPermissions.map(p => p.id))}
                          disabled={selectedPermissions.length === allPermissions.length}
                        >
                          Select All
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                )}

                {/* Menu Permissions Tab */}
                {currentTab === 1 && (
                  <Stack spacing={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Configure permissions for each menu item (only child menus can be configured)
                      </Typography>
                      <LoadingButton
                        variant="contained"
                        onClick={handleSaveMenuPermissions}
                        loading={savingMenuPermissions}
                        startIcon={<Iconify icon="eva:save-fill" />}
                      >
                        Save Menu Permissions
                      </LoadingButton>
                    </Box>

                    {Array.isArray(menusWithPermissions) && menusWithPermissions.length > 0 ? (
                      <Stack spacing={2}>
                        {/* Display menu permissions similar to All Permissions */}
                        {menusWithPermissions.map((parentMenu) => (
                          <Accordion key={parentMenu.id} defaultExpanded>
                            <AccordionSummary
                              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                            >
                              <Typography variant="subtitle1" fontWeight="bold">
                                {parentMenu.name} ({parentMenu.children?.length || 0} items)
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={2}>
                                {parentMenu.children && parentMenu.children.length > 0 ? (
                                  parentMenu.children.map((childMenu: any) => (
                                    <Grid item xs={12} sm={6} md={4} key={childMenu.id}>
                                      <Box
                                        sx={{ 
                                          border: 1,
                                          borderColor: 'divider',
                                          borderRadius: 1,
                                          p: 2,
                                          bgcolor: 'background.paper',
                                          '&:hover': {
                                            bgcolor: 'action.hover',
                                          }
                                        }}
                                      >
                                        <Stack spacing={2}>
                                          <Box display="flex" alignItems="center">
                                            <Iconify 
                                              icon={childMenu.icon || 'eva:menu-2-fill'} 
                                              sx={{ mr: 1, color: 'primary.main' }} 
                                            />
                                            <Typography variant="body2" fontWeight="medium">
                                              {childMenu.name}
                                            </Typography>
                                          </Box>
                                          
                                          {childMenu.url && (
                                            <Typography variant="caption" color="text.secondary">
                                              {childMenu.url}
                                            </Typography>
                                          )}

                                          <Stack spacing={1}>
                            {/* Standard CRUD permissions for child menus only */}
                            {['canView', 'canCreate', 'canUpdate', 'canDelete'].map((permissionKey) => {
                              const hasPermission = childMenu.permissions && 
                                typeof childMenu.permissions === 'object' && 
                                !Array.isArray(childMenu.permissions) ? 
                                Boolean(childMenu.permissions[permissionKey]) : false;
                              
                              const permissionLabel = permissionKey.replace('can', '');
                              
                              return (
                                <FormControlLabel
                                  key={permissionKey}
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={hasPermission}
                                      onChange={(e) => {
                                        // Update child menu permissions
                                        setMenusWithPermissions(prev => 
                                          prev.map(parent => {
                                            if (parent.id === parentMenu.id) {
                                              return {
                                                ...parent,
                                                children: parent.children?.map((child: any) => {
                                                  if (child.id === childMenu.id) {
                                                    return {
                                                      ...child,
                                                      permissions: {
                                                        ...child.permissions,
                                                        [permissionKey]: e.target.checked,
                                                      }
                                                    };
                                                  }
                                                  return child;
                                                })
                                              };
                                            }
                                            return parent;
                                          })
                                        );
                                      }}
                                    />
                                  }
                                  label={
                                    <Chip
                                      label={permissionLabel}
                                      size="small"
                                      variant="outlined"
                                      color={hasPermission ? 'primary' : 'default'}
                                      sx={{ fontSize: '0.75rem' }}
                                    />
                                  }
                                  sx={{ m: 0 }}
                                />
                              );
                            })}
                                          </Stack>

                                          <Typography variant="caption" display="block" color="text.secondary">
                                            {Object.values(childMenu.permissions || {}).filter(Boolean).length}/4 permissions selected
                                          </Typography>
                                        </Stack>
                                      </Box>
                                    </Grid>
                                  ))
                                ) : (
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                      No child menus available
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                        No menu permissions available
                      </Typography>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {menusWithPermissions.reduce((count, parent) => {
                          if (parent.children) {
                            return count + parent.children.reduce((childCount: number, child: any) => {
                              if (child.permissions && typeof child.permissions === 'object' && !Array.isArray(child.permissions)) {
                                return childCount + Object.values(child.permissions).filter(Boolean).length;
                              }
                              return childCount;
                            }, 0);
                          }
                          return count;
                        }, 0)} child menu permissions selected
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setMenusWithPermissions(prev => 
                              prev.map(parent => ({
                                ...parent,
                                children: parent.children?.map((child: any) => ({
                                  ...child,
                                  permissions: {
                                    canView: false,
                                    canCreate: false,
                                    canUpdate: false,
                                    canDelete: false,
                                  }
                                }))
                              }))
                            );
                          }}
                          startIcon={<Iconify icon="eva:close-fill" />}
                        >
                          Clear All
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setMenusWithPermissions(prev => 
                              prev.map(parent => ({
                                ...parent,
                                children: parent.children?.map((child: any) => ({
                                  ...child,
                                  permissions: {
                                    canView: true,
                                    canCreate: true,
                                    canUpdate: true,
                                    canDelete: true,
                                  }
                                }))
                              }))
                            );
                          }}
                          startIcon={<Iconify icon="eva:checkmark-fill" />}
                        >
                          Select All
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Form>
    </DashboardContent>
  );
}
