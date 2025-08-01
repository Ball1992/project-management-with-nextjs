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

import { propertyTypeService } from 'src/services/property-type.service';
import { languageService } from 'src/services/language.service';
import type { IPropertyType, CreatePropertyTypeDto, UpdatePropertyTypeDto, IPropertyTypeTranslation } from 'src/types/property-type';
import type { ILanguage } from 'src/types/language';

// ----------------------------------------------------------------------

export const PropertyTypeSchema = zod.object({
  code: zod.string().min(1, { message: 'Code is required!' }),
  sortOrder: zod.number().default(0),
  isActive: zod.boolean().default(true),
  // Translations
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string().optional(),
});

export type PropertyTypeSchemaType = zod.infer<typeof PropertyTypeSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentPropertyType?: IPropertyType;
};

export function PropertyTypeDetailView({ currentPropertyType }: Props) {
  const router = useRouter();
  const deleteActions = usePopover();
  const confirmDialog = useBoolean();
  
  const openDetails = useBoolean(true);
  const openSystemData = useBoolean(true);
  
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPropertyTypeData, setCurrentPropertyTypeData] = useState<IPropertyType | null>(currentPropertyType || null);

  const isEdit = !!currentPropertyType;

  // Get current translation for selected language
  const getCurrentTranslation = () => {
    if (!currentPropertyType || !selectedLanguage) return null;
    return currentPropertyType.translations?.find(t => t.languageCode === selectedLanguage.code);
  };

  const defaultValues: PropertyTypeSchemaType = {
    code: currentPropertyType?.code || '',
    sortOrder: currentPropertyType?.sortOrder || 0,
    isActive: currentPropertyType?.isActive ?? true,
    // Translations
    name: getCurrentTranslation()?.name || '',
    description: getCurrentTranslation()?.description || '',
  };

  const methods = useForm<PropertyTypeSchemaType>({
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
        
        // Get language from localStorage or use default (client-side only)
        const savedLanguageCode = typeof window !== 'undefined' 
          ? localStorage.getItem('selectedLanguageCode')
          : null;
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

  // Load property type data with language support when editing
  useEffect(() => {
    if (isEdit && currentPropertyType && selectedLanguage) {
      const fetchPropertyTypeDetail = async () => {
        try {
          setLoading(true);
          const detailedPropertyType = await propertyTypeService.getPropertyType(currentPropertyType.id, selectedLanguage.code);
          
          reset({
            code: detailedPropertyType.code || '',
            sortOrder: detailedPropertyType.sortOrder || 0,
            isActive: detailedPropertyType.isActive ?? true,
            // Direct fields from API response
            name: detailedPropertyType.name || '',
            description: detailedPropertyType.description || '',
          });
        } catch (error) {
          console.error('Error fetching property type details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPropertyTypeDetail();
    }
  }, [isEdit, currentPropertyType, selectedLanguage, reset]);

  // Update form when language changes
  useEffect(() => {
    if (currentPropertyType && selectedLanguage && isEdit) {
      const fetchPropertyTypeDetail = async () => {
        try {
          setLoading(true);
          const detailedPropertyType = await propertyTypeService.getPropertyType(currentPropertyType.id, selectedLanguage.code);
          
          // Only update language-specific fields
          setValue('name', detailedPropertyType.name || '');
          setValue('description', detailedPropertyType.description || '');
        } catch (error) {
          console.error('Error fetching property type details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPropertyTypeDetail();
    }
  }, [selectedLanguage, currentPropertyType, isEdit, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Prepare base property type data
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

      if (isEdit && currentPropertyType) {
        // For update
        const updateData: UpdatePropertyTypeDto = {
          ...baseData,
          translations: translationData,
        };
        
        await propertyTypeService.updatePropertyType(currentPropertyType.id, updateData);
        toast.success('Property type updated successfully!');
        
        // Reload data instead of redirecting
        if (selectedLanguage) {
          const updatedPropertyType = await propertyTypeService.getPropertyType(currentPropertyType.id, selectedLanguage.code);
          setCurrentPropertyTypeData(updatedPropertyType);
        }
      } else {
        // For create
        const createData: CreatePropertyTypeDto = {
          ...baseData,
          translations: translationData,
        };
        
        const response = await propertyTypeService.createPropertyType(createData);
        toast.success('Property type created successfully!');
        
        // Redirect to edit page with the new ID
        router.push(`/menu/our-penthouses/property-type/${response.id}`);
      }
    } catch (error) {
      console.error('Error saving property type:', error);
      toast.error('Failed to save property type');
    }
  });

  const handleDelete = async () => {
    if (!currentPropertyType) return;

    try {
      setDeleting(true);
      await propertyTypeService.deletePropertyType(currentPropertyType.id);
      toast.success('Property type deleted successfully!');
      router.push('/menu/our-penthouses/property-type');
    } catch (err) {
      console.error('Error deleting property type:', err);
      toast.error('Failed to delete property type');
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
        backHref={'/menu/our-penthouses/property-type'}
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Our Penthouses' },
          { name: 'Property Types', href: '/menu/our-penthouses/property-type' },
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
            {(currentPropertyTypeData || currentPropertyType) && (
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
                            {(currentPropertyTypeData || currentPropertyType)?.createdByName?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {(currentPropertyTypeData || currentPropertyType)?.createdByName || 'Unknown User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {(() => {
                                const dateStr = (currentPropertyTypeData || currentPropertyType)?.createdDate;
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
                      {(currentPropertyTypeData || currentPropertyType)?.updatedByName && (currentPropertyTypeData || currentPropertyType)?.updatedDate && (
                        <Divider sx={{ borderStyle: 'dashed' }} />
                      )}

                      {/* Updated By Section */}
                      {(currentPropertyTypeData || currentPropertyType)?.updatedByName && (currentPropertyTypeData || currentPropertyType)?.updatedDate && (
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
                              {(currentPropertyTypeData || currentPropertyType)?.updatedByName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {(currentPropertyTypeData || currentPropertyType)?.updatedByName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {(() => {
                                  const dateStr = (currentPropertyTypeData || currentPropertyType)?.updatedDate;
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
