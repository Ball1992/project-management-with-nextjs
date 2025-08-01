'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { useBoolean } from 'minimal-shared/hooks';

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
import LoadingButton from '@mui/lab/LoadingButton';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Collapse from '@mui/material/Collapse';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { CustomPopover } from 'src/components/custom-popover';
import { usePopover } from 'minimal-shared/hooks';
import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { locationService } from 'src/services/location.service';
import { languageService } from 'src/services/language.service';
import type { ILocation, CreateLocationDto, UpdateLocationDto, ILocationTranslation } from 'src/types/location';
import type { ILanguage } from 'src/types/language';

// ----------------------------------------------------------------------

export const LocationSchema = zod.object({
  code: zod.string().min(1, { message: 'Code is required!' }),
  sortOrder: zod.number().default(0),
  isActive: zod.boolean().default(true),
  // Translations
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string().optional(),
});

export type LocationSchemaType = zod.infer<typeof LocationSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentLocation?: ILocation;
};

export function LocationDetailView({ currentLocation }: Props) {
  const router = useRouter();
  const deleteActions = usePopover();
  const confirmDialog = useBoolean();
  
  const openDetails = useBoolean(true);
  const openSystemData = useBoolean(true);
  
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentLocationData, setCurrentLocationData] = useState<ILocation | null>(currentLocation || null);

  const isEdit = !!currentLocation;

  // Get current translation for selected language
  const getCurrentTranslation = () => {
    if (!currentLocation || !selectedLanguage) return null;
    return currentLocation.translations?.find(t => t.languageCode === selectedLanguage.code);
  };

  const defaultValues: LocationSchemaType = {
    code: currentLocation?.code || '',
    sortOrder: currentLocation?.sortOrder || 0,
    isActive: currentLocation?.isActive ?? true,
    // Translations
    name: getCurrentTranslation()?.name || '',
    description: getCurrentTranslation()?.description || '',
  };

  const methods = useForm<LocationSchemaType>({
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    reset,
  } = methods;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const languagesRes = await languageService.getLanguages({ limit: 100 });
        setLanguages(languagesRes.data.data);
        
        // Get language from localStorage or use default
        const savedLanguageCode = localStorage.getItem('selectedLanguageCode');
        const savedLanguage = savedLanguageCode 
          ? languagesRes.data.data.find((lang: ILanguage) => lang.code === savedLanguageCode)
          : null;
        
        const defaultLang = savedLanguage || 
          languagesRes.data.data.find((lang: ILanguage) => lang.isDefault) || 
          languagesRes.data.data[0];
          
        if (defaultLang) {
          setSelectedLanguage(defaultLang);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // Load location data with language support when editing
  useEffect(() => {
    if (isEdit && currentLocation && selectedLanguage) {
      const fetchLocationDetail = async () => {
        try {
          setLoading(true);
          const detailedLocation = await locationService.getLocation(currentLocation.id, selectedLanguage.code);
          
          reset({
            code: detailedLocation.code || '',
            sortOrder: detailedLocation.sortOrder || 0,
            isActive: detailedLocation.isActive ?? true,
            // Direct fields from API response
            name: detailedLocation.name || '',
            description: detailedLocation.description || '',
          });
        } catch (error) {
          console.error('Error fetching location details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchLocationDetail();
    }
  }, [isEdit, currentLocation, selectedLanguage, reset]);

  // Update form when language changes
  useEffect(() => {
    if (currentLocation && selectedLanguage && isEdit) {
      const fetchLocationDetail = async () => {
        try {
          setLoading(true);
          const detailedLocation = await locationService.getLocation(currentLocation.id, selectedLanguage.code);
          
          // Only update language-specific fields
          setValue('name', detailedLocation.name || '');
          setValue('description', detailedLocation.description || '');
        } catch (error) {
          console.error('Error fetching location details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchLocationDetail();
    }
  }, [selectedLanguage, currentLocation, isEdit, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Prepare base location data
      const baseData = {
        code: data.code,
        sortOrder: data.sortOrder,
      };

      // Prepare translation data
      const translationData = selectedLanguage ? [{
        languageCode: selectedLanguage.code,
        name: data.name,
        description: data.description || '',
      }] : [];

      if (isEdit && currentLocation) {
        // For update
        const updateData: UpdateLocationDto = {
          ...baseData,
          translations: translationData,
        };
        
        await locationService.updateLocation(currentLocation.id, updateData);
        toast.success('Location updated successfully!');
        
        // Reload data instead of redirecting
        if (selectedLanguage) {
          const updatedLocation = await locationService.getLocation(currentLocation.id, selectedLanguage.code);
          setCurrentLocationData(updatedLocation);
        }
      } else {
        // For create
        const createData: CreateLocationDto = {
          ...baseData,
          translations: translationData,
        };
        
        const response = await locationService.createLocation(createData);
        toast.success('Location created successfully!');
        
        // Redirect to edit page with the new ID
        router.push(`/menu/our-penthouses/locations/${response.id}`);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    }
  });

  const handleDelete = async () => {
    if (!currentLocation) return;

    try {
      setDeleting(true);
      await locationService.deleteLocation(currentLocation.id);
      toast.success('Location deleted successfully!');
      router.push('/menu/our-penthouses/locations');
    } catch (err) {
      console.error('Error deleting location:', err);
      toast.error('Failed to delete location');
      setDeleting(false);
    }
  };

  const currentTranslation = getCurrentTranslation();
  const currentLanguage = selectedLanguage;

  const renderCollapseButton = (value: boolean, onToggle: () => void) => (
    <IconButton onClick={onToggle}>
      <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
    </IconButton>
  );

  const renderDeleteActions = () => (
    <CustomPopover
      open={deleteActions.open}
      anchorEl={deleteActions.anchorEl}
      onClose={deleteActions.onClose}
      slotProps={{ arrow: { placement: 'top-right' } }}
    >
      <MenuList>
        <MenuItem 
          onClick={() => {
            confirmDialog.onTrue();
            deleteActions.onClose();
          }}
          sx={{ 
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.lighter',
            }
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`${isEdit ? 'Edit' : 'Create'}`}
        backHref={'/menu/our-penthouses/locations'}
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Our Penthouses' },
          { name: 'Locations', href: '/menu/our-penthouses/locations' },
          { name: isEdit ? 'Edit' : 'Create' },
        ]}
        action={
          <Stack direction="row" spacing={2} alignItems="center">
            <LoadingButton
              onClick={onSubmit}
              variant="contained"
              loading={isSubmitting}
              sx={{
                backgroundColor: 'grey.800',
                color: 'common.white',
                '&:hover': {
                  backgroundColor: 'grey.900',
                }
              }}
            >
              {isEdit ? 'Update' : 'Create'}
            </LoadingButton>
            {isEdit && (
              <IconButton onClick={deleteActions.onOpen}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isEdit ? (
        // Edit Mode: Centered layout with sidebar at bottom (same width as create mode)
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
            <Card>
              <CardHeader
                title="Information"
                subheader="Code, name..."
                action={renderCollapseButton(openDetails.value, openDetails.onToggle)}
                sx={{ mb: 3 }}
              />
              
              <Collapse in={openDetails.value}>
                <Divider />
                <Stack spacing={3} sx={{ p: 3 }}>
                  <Field.Text
                    name="code"
                    label="Code"
                    placeholder="Enter code"
                    required
                  />

                  <Field.Text
                    name="name"
                    label="Name"
                    placeholder="Enter name"
                    required
                  />
                </Stack>
              </Collapse>
            </Card>

            {/* Sidebar for Edit Mode - Moved to Bottom */}
            {(currentLocationData || currentLocation) && (
              <Card>
                <CardHeader
                  title="History"
                  subheader="Created, updated..."
                  action={renderCollapseButton(openSystemData.value, openSystemData.onToggle)}
                  sx={{ mb: 3 }}
                />
                
                <Collapse in={openSystemData.value}>
                  <Divider />
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                  {/* Created By Section */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Created By
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {(currentLocationData || currentLocation)?.createdByName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {(currentLocationData || currentLocation)?.createdByName || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(() => {
                            const dateStr = (currentLocationData || currentLocation)?.createdDate;
                            if (!dateStr) return 'No date';
                            
                            const [datePart, timePart] = dateStr.split(' ');
                            if (!datePart) return 'Invalid Date';
                            
                            const [day, month, year] = datePart.split('/');
                            if (!day || !month || !year) return 'Invalid Date';
                            
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
                          })()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Divider */}
                  {(currentLocationData || currentLocation)?.updatedByName && (currentLocationData || currentLocation)?.updatedDate && (
                    <Divider sx={{ borderStyle: 'dashed' }} />
                  )}

                  {/* Updated By Section */}
                  {(currentLocationData || currentLocation)?.updatedByName && (currentLocationData || currentLocation)?.updatedDate && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Updated By
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'primary.main',
                          }}
                        >
                          {(currentLocationData || currentLocation)?.updatedByName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {(currentLocationData || currentLocation)?.updatedByName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(() => {
                              const dateStr = (currentLocationData || currentLocation)?.updatedDate;
                              if (!dateStr) return 'No date';
                              
                              const [datePart, timePart] = dateStr.split(' ');
                              if (!datePart) return 'Invalid Date';
                              
                              const [day, month, year] = datePart.split('/');
                              if (!day || !month || !year) return 'Invalid Date';
                              
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
                            })()}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                    </Stack>
                  </CardContent>
                </Collapse>
              </Card>
            )}
          </Stack>
        </Form>
      ) : (
        // Create Mode: Centered layout
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
            <Card>
              <CardHeader
                title="Information"
                subheader="Code, name..."
                action={renderCollapseButton(openDetails.value, openDetails.onToggle)}
                sx={{ mb: 3 }}
              />
              
              <Collapse in={openDetails.value}>
                <Divider />
                <Stack spacing={3} sx={{ p: 3 }}>
                  <Field.Text
                    name="code"
                    label="Code"
                    placeholder="Enter code"
                    required
                  />

                  <Field.Text
                    name="name"
                    label="Name"
                    placeholder="Enter name"
                    required
                  />
                </Stack>
              </Collapse>
            </Card>
          </Stack>
        </Form>
      )}

      {renderDeleteActions()}
      
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete();
              confirmDialog.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
