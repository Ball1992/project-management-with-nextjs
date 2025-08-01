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

import { zoneService } from 'src/services/zone.service';
import { languageService } from 'src/services/language.service';
import type { IZone, CreateZoneDto, UpdateZoneDto, IZoneTranslation } from 'src/types/zone';
import type { ILanguage } from 'src/types/language';

// ----------------------------------------------------------------------

export const ZoneSchema = zod.object({
  code: zod.string().min(1, { message: 'Code is required!' }),
  sortOrder: zod.number().default(0),
  isActive: zod.boolean().default(true),
  // Translations
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string().optional(),
});

export type ZoneSchemaType = zod.infer<typeof ZoneSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentZone?: IZone;
};

export function ZoneDetailView({ currentZone }: Props) {
  const router = useRouter();
  const deleteActions = usePopover();
  const confirmDialog = useBoolean();
  
  const openDetails = useBoolean(true);
  const openSystemData = useBoolean(true);
  
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentZoneData, setCurrentZoneData] = useState<IZone | null>(currentZone || null);

  const isEdit = !!currentZone;

  // Get current translation for selected language
  const getCurrentTranslation = () => {
    if (!currentZone || !selectedLanguage) return null;
    return currentZone.translations?.find(t => t.languageCode === selectedLanguage.code);
  };

  const defaultValues: ZoneSchemaType = {
    code: currentZone?.code || '',
    sortOrder: currentZone?.sortOrder || 0,
    isActive: currentZone?.isActive ?? true,
    // Translations
    name: getCurrentTranslation()?.name || '',
    description: getCurrentTranslation()?.description || '',
  };

  const methods = useForm<ZoneSchemaType>({
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

  // Load zone data with language support when editing
  useEffect(() => {
    if (isEdit && currentZone && selectedLanguage) {
      const fetchZoneDetail = async () => {
        try {
          setLoading(true);
          const detailedZone = await zoneService.getZone(currentZone.id.toString(), selectedLanguage.code);
          
          reset({
            code: detailedZone.code || '',
            sortOrder: detailedZone.sortOrder || 0,
            isActive: detailedZone.isActive ?? true,
            // Direct fields from API response
            name: detailedZone.name || '',
            description: detailedZone.description || '',
          });
        } catch (error) {
          console.error('Error fetching zone details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchZoneDetail();
    }
  }, [isEdit, currentZone, selectedLanguage, reset]);

  // Update form when language changes
  useEffect(() => {
    if (currentZone && selectedLanguage && isEdit) {
      const fetchZoneDetail = async () => {
        try {
          setLoading(true);
          const detailedZone = await zoneService.getZone(currentZone.id.toString(), selectedLanguage.code);
          
          // Only update language-specific fields
          setValue('name', detailedZone.name || '');
          setValue('description', detailedZone.description || '');
        } catch (error) {
          console.error('Error fetching zone details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchZoneDetail();
    }
  }, [selectedLanguage, currentZone, isEdit, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Prepare base zone data
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

      if (isEdit && currentZone) {
        // For update
        const updateData: UpdateZoneDto = {
          ...baseData,
          translations: translationData,
        };
        
        await zoneService.updateZone(currentZone.id.toString(), updateData);
        toast.success('Zone updated successfully!');
        
        // Reload data instead of redirecting
        if (selectedLanguage) {
          const updatedZone = await zoneService.getZone(currentZone.id.toString(), selectedLanguage.code);
          setCurrentZoneData(updatedZone);
        }
      } else {
        // For create
        const createData: CreateZoneDto = {
          ...baseData,
          translations: translationData,
        };
        
        const response = await zoneService.createZone(createData);
        toast.success('Zone created successfully!');
        
        // Redirect to edit page with the new ID
        router.push(`/menu/our-penthouses/zones/${response.id}`);
      }
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error('Failed to save zone');
    }
  });

  const handleDelete = async () => {
    if (!currentZone) return;

    try {
      setDeleting(true);
      await zoneService.deleteZone(currentZone.id.toString());
      toast.success('Zone deleted successfully!');
      router.push('/menu/our-penthouses/zones');
    } catch (err) {
      console.error('Error deleting zone:', err);
      toast.error('Failed to delete zone');
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
        backHref={'/menu/our-penthouses/zones'}
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Our Penthouses' },
          { name: 'Zones', href: '/menu/our-penthouses/zones' },
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
                    placeholder="Enter zone code"
                    required
                  />

                  <Field.Text
                    name="name"
                    label="Name"
                    placeholder="Enter zone name"
                    required
                  />
                </Stack>
              </Collapse>
            </Card>

            {/* Sidebar for Edit Mode - Moved to Bottom */}
            {(currentZoneData || currentZone) && (
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
                        {(currentZoneData || currentZone)?.createdByName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {(currentZoneData || currentZone)?.createdByName || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(() => {
                            const dateStr = (currentZoneData || currentZone)?.createdDate;
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
                  {(currentZoneData || currentZone)?.updatedByName && (currentZoneData || currentZone)?.updatedDate && (
                    <Divider sx={{ borderStyle: 'dashed' }} />
                  )}

                  {/* Updated By Section */}
                  {(currentZoneData || currentZone)?.updatedByName && (currentZoneData || currentZone)?.updatedDate && (
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
                          {(currentZoneData || currentZone)?.updatedByName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {(currentZoneData || currentZone)?.updatedByName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(() => {
                              const dateStr = (currentZoneData || currentZone)?.updatedDate;
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
                title="Zone"
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
