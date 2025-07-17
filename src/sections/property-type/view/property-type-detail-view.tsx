'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { propertyTypeService } from 'src/services/property-type.service';
import type { IPropertyType, UpdatePropertyTypeDto } from 'src/types/property-type';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function PropertyTypeDetailView({ id }: Props) {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState<IPropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editData, setEditData] = useState<UpdatePropertyTypeDto>({
    name: ''
  });

  useEffect(() => {
    const fetchPropertyType = async () => {
      try {
        setLoading(true);
        const response = await propertyTypeService.getPropertyType(id);
        setPropertyType(response);
        setEditData({
          name: response.name
        });
      } catch (err) {
        setError('Failed to load property type');
        console.error('Error fetching property type:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyType();
  }, [id]);

  const handleUpdate = async () => {
    if (!propertyType || !editData.name?.trim()) return;

    try {
      setUpdating(true);
      const updatedPropertyType = await propertyTypeService.updatePropertyType(propertyType.id, editData);
      setPropertyType(updatedPropertyType);
      setEditOpen(false);
    } catch (err) {
      console.error('Error updating property type:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!propertyType) return;

    try {
      setDeleting(true);
      await propertyTypeService.deletePropertyType(propertyType.id);
      router.push('/menu/our-penthouses/property-type');
    } catch (err) {
      console.error('Error deleting property type:', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error || !propertyType) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Typography color="error">{error || 'Property type not found'}</Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Property Type Detail"
        links={[
          { name: 'Menu', href: '/menu' },
          { name: 'Our Penthouses', href: '/menu/our-penthouses' },
          { name: 'Property Types', href: '/menu/our-penthouses/property-type' },
          { name: propertyType.name },
        ]}
        action={
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="eva:edit-fill" />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="eva:trash-2-outline" />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </Box>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Property Type Information
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {propertyType.name}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={propertyType.isActive ? 'Enable' : 'Disable'}
                  color={propertyType.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body1">
                  {new Date(propertyType.createdDate).toLocaleString()}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Updated Date
                </Typography>
                <Typography variant="body1">
                  {new Date(propertyType.updatedDate).toLocaleString()}
                </Typography>
              </Box>

              {propertyType.createdByName && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {propertyType.createdByName}
                  </Typography>
                </Box>
              )}

              {propertyType.updatedByName && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Updated By
                  </Typography>
                  <Typography variant="body1">
                    {propertyType.updatedByName}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Property Type</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Property Type Name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained"
            disabled={updating || !editData.name?.trim()}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Property Type</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this property type? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
