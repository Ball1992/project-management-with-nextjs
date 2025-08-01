'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomPopover } from 'src/components/custom-popover';
import { usePopover } from 'minimal-shared/hooks';
import { toast } from 'src/components/snackbar';

import { requestInformationService } from 'src/services/request-information.service';
import type { IRequestInformation, UpdateRequestInformationDto } from 'src/types/request-information';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function RequestInformationDetailView({ id }: Props) {
  const router = useRouter();
  const deleteActions = usePopover();
  
  const [request, setRequest] = useState<IRequestInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
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

        // Auto-update status from 'new' to 'read' when entering detail view
        if (response.status === 'new') {
          try {
            const updatedRequest = await requestInformationService.updateRequestInformation(
              response.id.toString(), 
              { status: 'read' }
            );
            setRequest(updatedRequest);
            setEditData({ status: updatedRequest.status });
          } catch (updateErr) {
            console.error('Error auto-updating request information status:', updateErr);
            // Don't show error to user for auto-update, just log it
          }
        }
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
      const updatedRequest = await requestInformationService.updateRequestInformation(request.id.toString(), editData);
      setRequest(updatedRequest);
      setEditOpen(false);
      toast.success('Request information updated successfully!');
    } catch (err) {
      console.error('Error updating request information:', err);
      toast.error('Failed to update request information');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;

    try {
      setDeleting(true);
      await requestInformationService.deleteRequestInformation(request.id.toString());
      toast.success('Request information deleted successfully!');
      router.push('/menu/our-penthouses/request-information');
    } catch (err) {
      console.error('Error deleting request information:', err);
      toast.error('Failed to delete request information');
      setDeleting(false);
    }
  };



  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No date';
    
    // Parse DD/MM/YYYY HH:mm:ss format from API
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart) return 'Invalid Date';
    
    // Split DD/MM/YYYY
    const [day, month, year] = datePart.split('/');
    if (!day || !month || !year) return 'Invalid Date';
    
    // Create date in MM/DD/YYYY format for JavaScript
    const jsDateStr = `${month}/${day}/${year}${timePart ? ` ${timePart}` : ''}`;
    const date = new Date(jsDateStr);
    
    return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) : 'Invalid Date';
  };

  const handleStatusUpdate = async (newStatus: 'read' | 'unread') => {
    if (!request) return;

    try {
      setUpdating(true);
      const updatedRequest = await requestInformationService.updateRequestInformation(
        request.id.toString(), 
        { status: newStatus }
      );
      setRequest(updatedRequest);
      setEditData({ status: updatedRequest.status });
      deleteActions.onClose();
      toast.success('Request status updated successfully!');
    } catch (err) {
      console.error('Error updating request status:', err);
      toast.error('Failed to update request status');
    } finally {
      setUpdating(false);
    }
  };

  const renderDeleteActions = () => (
    <CustomPopover
      open={deleteActions.open}
      anchorEl={deleteActions.anchorEl}
      onClose={deleteActions.onClose}
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
        heading="View"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Our Penthouses' },
          { name: 'View' },
        ]}
        action={
          <Button
            variant="outlined"
            color="primary"
            endIcon={<Iconify icon="eva:chevron-down-fill" />}
            onClick={deleteActions.onOpen}
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
            {request.status === 'read' ? 'Read' : request.status === 'unread' ? 'Unread' : 'New'}
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
                  value={request.firstName}
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
                  value={request.lastName}
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
                  value={request.email}
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
                  value={request.phoneNumber || '-'}
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
                  value={request.message}
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

        {/* Schedule a Property Tour Card */}
        <Card>
          <CardHeader
            title="Schedule a Property Tour"
            sx={{ pb: 3 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ mb: 2 }}>Tour Type</FormLabel>
                  <RadioGroup
                    row
                    value={request.tourType}
                    sx={{ gap: 4 }}
                  >
                    <FormControlLabel
                      value="on_site"
                      control={<Radio checked={request.tourType === 'on_site'} />}
                      label="On-site Tour"
                      disabled
                    />
                    <FormControlLabel
                      value="virtual"
                      control={<Radio checked={request.tourType === 'virtual'} />}
                      label="Virtual Tour"
                      disabled
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date"
                  value={request.firstAvailability || '-'}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Period"
                  value={request.hourPreference || '-'}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
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
                  value={formatDate(request.createdDate).split(',')[0]}
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
                  value={formatDate(request.createdDate).split(',')[1]?.trim() || '-'}
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
            <MenuItem value="read">Read</MenuItem>
            <MenuItem value="unread">Unread</MenuItem>
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

      {renderDeleteActions()}
    </DashboardContent>
  );
}
