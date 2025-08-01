'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { fDate, fTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomPopover } from 'src/components/custom-popover';
import { usePopover } from 'minimal-shared/hooks';
import { toast } from 'src/components/snackbar';

import { contactService } from 'src/services/contact.service';
import type { IContact, UpdateContactDto } from 'src/types/contact';
import { CONTACT_STATUS_MAPPING } from 'src/types/contact';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ContactDetailView({ id }: Props) {
  const router = useRouter();
  const statusActions = usePopover();
  
  const [contact, setContact] = useState<IContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

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

        // Auto-update status from 'new' to 'read' when entering detail view
        if (response.status === 'new') {
          try {
            const updatedContact = await contactService.updateContact(
              response.id, 
              { status: 'read' }
            );
            setContact(updatedContact);
            setEditData({ status: updatedContact.status });
          } catch (updateErr) {
            console.error('Error auto-updating contact status:', updateErr);
            // Don't show error to user for auto-update, just log it
          }
        }
      } catch (err) {
        setError('Failed to load contact');
        console.error('Error fetching contact:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleStatusUpdate = async (newStatus: 'new' | 'read' | 'unread') => {
    if (!contact) return;

    try {
      setUpdating(true);
      const updatedContact = await contactService.updateContact(
        contact.id, 
        { status: newStatus }
      );
      setContact(updatedContact);
      setEditData({ status: updatedContact.status });
      statusActions.onClose();
      toast.success('Contact status updated successfully!');
    } catch (err) {
      console.error('Error updating contact status:', err);
      toast.error('Failed to update contact status');
    } finally {
      setUpdating(false);
    }
  };

  const formatContactDate = (dateStr: string) => {
    if (!dateStr) return '-';
    
    try {
      // Handle different date formats
      let date: Date;
      
      // Check if it's in DD/MM/YYYY HH:mm:ss format (like locations)
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hour, minute, second] = timePart?.split(':') || ['00', '00', '00'];
        
        // Create date with format: YYYY-MM-DD HH:mm:ss
        date = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
      } else {
        // Handle ISO format or other standard formats
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) return '-';
      
      return fDate(date);
    } catch (error) {
      return '-';
    }
  };

  const formatContactTime = (dateStr: string) => {
    if (!dateStr) return '-';
    
    try {
      // Handle different date formats
      let date: Date;
      
      // Check if it's in DD/MM/YYYY HH:mm:ss format (like locations)
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hour, minute, second] = timePart?.split(':') || ['00', '00', '00'];
        
        // Create date with format: YYYY-MM-DD HH:mm:ss
        date = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
      } else {
        // Handle ISO format or other standard formats
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) return '-';
      
      return fTime(date);
    } catch (error) {
      return '-';
    }
  };

  const renderStatusActions = () => (
    <CustomPopover
      open={statusActions.open}
      anchorEl={statusActions.anchorEl}
      onClose={statusActions.onClose}
      slotProps={{ arrow: { placement: 'top-right' } }}
    >
      <MenuList>
        <MenuItem 
          onClick={() => handleStatusUpdate('read')}
          disabled={updating}
        >
          Read
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusUpdate('unread')}
          disabled={updating}
        >
          Unread
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

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
        heading="View"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Contact Us', href: '/menu/contact' },
          { name: 'View' },
        ]}
        action={
          <Button
            variant="outlined"
            color="primary"
            endIcon={<Iconify icon="eva:chevron-down-fill" />}
            onClick={statusActions.onOpen}
            sx={{
              backgroundColor: 'grey.800',
              color: 'common.white',
              borderColor: 'grey.800',
              '&:hover': {
                backgroundColor: 'grey.900',
                borderColor: 'grey.900',
              }
            }}
          >
            {CONTACT_STATUS_MAPPING[contact.status] || contact.status.replace('_', ' ')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {/* Information Card */}
        <Card>
          <CardHeader
            title="Information"
            subheader="Title, short description, image..."
            sx={{ pb: 3 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={contact.firstName}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={contact.lastName}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={contact.email}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={contact.phoneNumber || '-'}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  value={contact.message}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Submitted Card */}
        <Card>
          <CardHeader
            title="Submitted"
            subheader="Title, short description, image..."
            sx={{ pb: 3 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date"
                  value={formatContactDate(contact.createdDate)}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Time"
                  value={formatContactTime(contact.createdDate)}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>

      {renderStatusActions()}
    </DashboardContent>
  );
}
