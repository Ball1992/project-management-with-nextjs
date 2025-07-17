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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { contactService } from 'src/services/contact.service';
import type { IContact, UpdateContactDto } from 'src/types/contact';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ContactDetailView({ id }: Props) {
  const router = useRouter();
  const [contact, setContact] = useState<IContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editData, setEditData] = useState<UpdateContactDto>({
    status: 'new'
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const response = await contactService.getContact(id);
        setContact(response);
        setEditData({
          status: response.status
        });
      } catch (err) {
        setError('Failed to load contact');
        console.error('Error fetching contact:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleUpdate = async () => {
    if (!contact) return;

    try {
      setUpdating(true);
      const updatedContact = await contactService.updateContact(contact.id, editData);
      setContact(updatedContact);
      setEditOpen(false);
    } catch (err) {
      console.error('Error updating contact:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    try {
      setDeleting(true);
      await contactService.deleteContact(contact.id);
      router.push('/menu/contact');
    } catch (err) {
      console.error('Error deleting contact:', err);
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

  if (error || !contact) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Typography color="error">{error || 'Contact not found'}</Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Contact Detail"
        links={[
          { name: 'Menu', href: '/menu' },
          { name: 'Contact', href: '/menu/contact' },
          { name: `${contact.firstName} ${contact.lastName}` },
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
                Contact Information
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {contact.firstName} {contact.lastName}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {contact.email}
                </Typography>
              </Box>

              {contact.phoneNumber && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1">
                    {contact.phoneNumber}
                  </Typography>
                </Box>
              )}

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={contact.status.replace('_', ' ').toUpperCase()}
                  color={
                    contact.status === 'new' ? 'primary' :
                    contact.status === 'in_progress' ? 'warning' :
                    contact.status === 'resolved' ? 'success' : 'default'
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
                {contact.message}
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
                    {new Date(contact.createdDate).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Updated Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(contact.updatedDate).toLocaleString()}
                  </Typography>
                </Grid>

                {contact.ipAddress && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body1">
                      {contact.ipAddress}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Active Status
                  </Typography>
                  <Typography variant="body1">
                    {contact.isActive ? 'Enable' : 'Disable'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Contact Status</DialogTitle>
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
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this contact? This action cannot be undone.
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
