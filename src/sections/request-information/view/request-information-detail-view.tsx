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
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { requestInformationService } from 'src/services/request-information.service';
import type { IRequestInformation, UpdateRequestInformationDto } from 'src/types/request-information';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function RequestInformationDetailView({ id }: Props) {
  const router = useRouter();
  const [request, setRequest] = useState<IRequestInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editData, setEditData] = useState<UpdateRequestInformationDto>({
    status: 'new'
  });

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await requestInformationService.getRequestInformationById(id);
        setRequest(response);
        setEditData({
          status: response.status
        });
      } catch (err) {
        setError('Failed to load request information');
        console.error('Error fetching request information:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleUpdate = async () => {
    if (!request) return;

    try {
      setUpdating(true);
      const updatedRequest = await requestInformationService.updateRequestInformation(request.id, editData);
      setRequest(updatedRequest);
      setEditOpen(false);
    } catch (err) {
      console.error('Error updating request information:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;

    try {
      setDeleting(true);
      await requestInformationService.deleteRequestInformation(request.id);
      router.push('/menu/our-penthouses/request-information');
    } catch (err) {
      console.error('Error deleting request information:', err);
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

  if (error || !request) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Typography color="error">{error || 'Request information not found'}</Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Request Information Detail"
        links={[
          { name: 'Menu', href: '/menu' },
          { name: 'Our Penthouses', href: '/menu/our-penthouses' },
          { name: 'Request Information', href: '/menu/our-penthouses/request-information' },
          { name: `${request.firstName} ${request.lastName}` },
        ]}
        action={
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="eva:edit-fill" />}
              onClick={() => setEditOpen(true)}
            >
              Update
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
                Request Information
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {request.firstName} {request.lastName}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {request.email}
                </Typography>
              </Box>

              {request.phoneNumber && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1">
                    {request.phoneNumber}
                  </Typography>
                </Box>
              )}

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={request.status.replace('_', ' ').toUpperCase()}
                  color={
                    request.status === 'new' ? 'primary' :
                    request.status === 'in_progress' ? 'warning' :
                    request.status === 'resolved' ? 'success' : 'default'
                  }
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Message
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {request.message}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(request.createdDate).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Updated Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(request.updatedDate).toLocaleString()}
                  </Typography>
                </Grid>

                {request.ipAddress && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body1">
                      {request.ipAddress}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Active Status
                  </Typography>
                  <Typography variant="body1">
                    {request.isActive ? 'Enable' : 'Disable'}
                  </Typography>
                </Grid>

                {request.createdByName && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body1">
                      {request.createdByName}
                    </Typography>
                  </Grid>
                )}

                {request.updatedByName && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Updated By
                    </Typography>
                    <Typography variant="body1">
                      {request.updatedByName}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Status"
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Request Information</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this request information? This action cannot be undone.
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
