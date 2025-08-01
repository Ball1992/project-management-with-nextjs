'use client';

import type { IPermission } from 'src/types/permission';
import type { MenuPermissionsResponse } from 'src/types/role';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { RoleService } from 'src/services/role.service';
import {
  buildMenuPermissionsTree,
  flattenMenuPermissionsTree,
  countTotalPermissions,
  countSelectedPermissions,
  updateMenuPermissions,
  selectAllMenuPermissions,
  clearAllMenuPermissions,
  exportMenuPermissionsForAPI,
  type MenuWithPermissions,
} from 'src/utils/menu-permissions-transform';

// ----------------------------------------------------------------------

interface MenuPermissionsManagerProps {
  roleId: string;
  onPermissionsChange?: (permissions: Array<{
    id: string;
    name: string;
    permissions: {
      canView: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    };
  }>) => void;
}

export function MenuPermissionsManager({ roleId, onPermissionsChange }: MenuPermissionsManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuTree, setMenuTree] = useState<MenuWithPermissions[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());

  // Fetch menu permissions data
  const fetchMenuPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response: MenuPermissionsResponse = await RoleService.getMenusWithPermissions(roleId);
      
      if (response.responseStatus === 200) {
        // Build hierarchical tree from flat menu list
        const tree = buildMenuPermissionsTree(response.data.data);
        setMenuTree(tree);
        
        // Expand all accordions by default
        const allMenuIds = new Set(response.data.data.map(menu => menu.id));
        setExpandedAccordions(allMenuIds);
      } else {
        toast.error(response.responseMessage || 'Failed to fetch menu permissions');
      }
    } catch (error) {
      console.error('Error fetching menu permissions:', error);
      toast.error('Failed to fetch menu permissions');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchMenuPermissions();
  }, [fetchMenuPermissions]);

  // Handle permission change for a specific menu
  const handleMenuPermissionChange = useCallback((menuId: string, permissionId: string, checked: boolean) => {
    setMenuTree(prevTree => {
      // Check if prevTree is an array
      if (!Array.isArray(prevTree)) {
        console.error('menuTree is not an array in handleMenuPermissionChange:', prevTree);
        return [];
      }

      const updatedTree = updateMenuPermissions(prevTree, menuId, 
        checked 
          ? [...(findMenuInTree(prevTree, menuId)?.selectedPermissions || []), permissionId]
          : (findMenuInTree(prevTree, menuId)?.selectedPermissions || []).filter(id => id !== permissionId)
      );
      
      // Notify parent component of changes
      if (onPermissionsChange) {
        onPermissionsChange(exportMenuPermissionsForAPI(updatedTree));
      }
      
      return updatedTree;
    });
  }, [onPermissionsChange]);

  // Helper function to find menu in tree
  const findMenuInTree = (tree: MenuWithPermissions[], menuId: string): MenuWithPermissions | null => {
    for (const menu of tree) {
      if (menu.id === menuId) return menu;
      if (menu.children) {
        const found = findMenuInTree(menu.children, menuId);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle select all permissions
  const handleSelectAll = useCallback(() => {
    const updatedTree = selectAllMenuPermissions(menuTree);
    setMenuTree(updatedTree);
    
    if (onPermissionsChange) {
      onPermissionsChange(exportMenuPermissionsForAPI(updatedTree));
    }
  }, [menuTree, onPermissionsChange]);

  // Handle clear all permissions
  const handleClearAll = useCallback(() => {
    const updatedTree = clearAllMenuPermissions(menuTree);
    setMenuTree(updatedTree);
    
    if (onPermissionsChange) {
      onPermissionsChange(exportMenuPermissionsForAPI(updatedTree));
    }
  }, [menuTree, onPermissionsChange]);

  // Handle save permissions
  const handleSavePermissions = useCallback(async () => {
    try {
      setSaving(true);
      const permissionsData = exportMenuPermissionsForAPI(menuTree);
      
      const response = await RoleService.updatePermissionsFromMenus({
        roleId,
        permissions: permissionsData,
      });

      if (response.responseStatus === 200) {
        toast.success('Menu permissions updated successfully!');
        fetchMenuPermissions(); // Refresh data
      } else {
        toast.error(response.responseMessage || 'Failed to update menu permissions');
      }
    } catch (error) {
      console.error('Error updating menu permissions:', error);
      toast.error('Failed to update menu permissions');
    } finally {
      setSaving(false);
    }
  }, [menuTree, roleId, fetchMenuPermissions]);

  // Handle accordion expand/collapse
  const handleAccordionChange = useCallback((menuId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.add(menuId);
      } else {
        newSet.delete(menuId);
      }
      return newSet;
    });
  }, []);

  // Filter menus based on search term
  const filteredMenuTree = menuTree.filter(menu => 
    !searchTerm || 
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalPermissions = countTotalPermissions(menuTree);
  const selectedPermissions = countSelectedPermissions(menuTree);
  const progressPercentage = totalPermissions > 0 ? (selectedPermissions / totalPermissions) * 100 : 0;

  // Render menu item with permissions
  const renderMenuItem = (menu: MenuWithPermissions, level: number = 0) => (
    <Accordion
      key={menu.id}
      expanded={expandedAccordions.has(menu.id)}
      onChange={handleAccordionChange(menu.id)}
      sx={{ 
        ml: level * 2,
        '&:before': { display: 'none' },
        boxShadow: level > 0 ? 1 : 2,
      }}
    >
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
              label={`${menu.selectedPermissions?.length || 0}/${menu.permissions?.length || 0}`}
              size="small"
              color={
                (menu.selectedPermissions?.length || 0) === (menu.permissions?.length || 0) && (menu.permissions?.length || 0) > 0
                  ? 'success'
                  : (menu.selectedPermissions?.length || 0) > 0
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
          
          {menu.permissions && menu.permissions.length > 0 && (
            <FormGroup row>
              {menu.permissions.map((permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={(menu.selectedPermissions || []).includes(permission.id)}
                      onChange={(e) => 
                        handleMenuPermissionChange(menu.id, permission.id, e.target.checked)
                      }
                    />
                  }
                  label={
                    <Chip
                      label={permission.name}
                      size="small"
                      variant="outlined"
                      color={(menu.selectedPermissions || []).includes(permission.id) ? 'primary' : 'default'}
                    />
                  }
                />
              ))}
            </FormGroup>
          )}
          
          {menu.children && menu.children.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Submenus:
              </Typography>
              {menu.children.map(child => renderMenuItem(child, level + 1))}
            </Stack>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">Loading Menu Permissions...</Typography>
          <LinearProgress sx={{ width: '100%' }} />
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Menu Permissions</Typography>
          <Button
            variant="contained"
            onClick={handleSavePermissions}
            loading={saving}
            startIcon={<Iconify icon="eva:save-fill" />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </Box>

        {/* Statistics */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Permissions Status: {selectedPermissions} of {totalPermissions} selected ({progressPercentage.toFixed(1)}%)
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Box>
        </Alert>

        {/* Search and Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <TextField
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 300 }}
          />
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={handleClearAll}
              disabled={selectedPermissions === 0}
              startIcon={<Iconify icon="eva:close-fill" />}
            >
              Clear All
            </Button>
            <Button
              variant="outlined"
              onClick={handleSelectAll}
              disabled={selectedPermissions === totalPermissions}
              startIcon={<Iconify icon="eva:checkmark-fill" />}
            >
              Select All
            </Button>
          </Stack>
        </Box>

        {/* Menu Tree */}
        {filteredMenuTree.length > 0 ? (
          <Stack spacing={1}>
            {filteredMenuTree.map(menu => renderMenuItem(menu))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            {searchTerm ? 'No menus found matching your search.' : 'No menu permissions available.'}
          </Typography>
        )}

        {/* Footer Actions */}
        <Box display="flex" justifyContent="center" pt={2}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSavePermissions}
            loading={saving}
            startIcon={<Iconify icon="eva:save-fill" />}
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save Menu Permissions'}
          </Button>
        </Box>
      </Stack>
    </Card>
  );
}
