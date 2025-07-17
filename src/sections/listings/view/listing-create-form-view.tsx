'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { Controller } from 'react-hook-form';
import { WorkspacesPopover } from 'src/layouts/components/workspaces-popover';
import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';

import { penthouseService } from 'src/services/penthouse.service';
import { locationService } from 'src/services/location.service';
import { propertyTypeService } from 'src/services/property-type.service';
import { officeTypeService } from 'src/services/office-type.service';
import { languageService } from 'src/services/language.service';
import type { ILocation } from 'src/types/location';
import type { IPropertyType } from 'src/types/property-type';
import type { IOfficeType } from 'src/types/office-type';
import type { ILanguage } from 'src/types/language';

// ----------------------------------------------------------------------

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const NewListingSchema = zod.object({
  title: zod.string().min(1, { message: 'Title is required!' }),
  coverImage: schemaHelper.file().optional(),
  locationId: zod.string().optional(),
  propertyTypeId: zod.string().optional(),
  officeTypeId: zod.string().optional(),
  propertyPrice: zod.string().optional(),
  status: zod.enum(['draft', 'published', 'archived']),
  publishStartDate: zod.string().optional(),
  publishEndDate: zod.string().optional(),
  content: zod.string().optional(),
  neighborhood: zod.string().optional(),
  galleryImages: zod.array(zod.any()).optional(),
});

export type NewListingSchemaType = zod.infer<typeof NewListingSchema>;

// ----------------------------------------------------------------------

export function ListingCreateFormView() {
  const router = useRouter();
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [officeTypes, setOfficeTypes] = useState<IOfficeType[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const defaultValues: NewListingSchemaType = {
    title: '',
    coverImage: null,
    locationId: '',
    propertyTypeId: '',
    officeTypeId: '',
    propertyPrice: undefined,
    status: 'draft',
    publishStartDate: '',
    publishEndDate: '',
    content: '',
    neighborhood: '',
    galleryImages: [],
  };

  const methods = useForm<NewListingSchemaType>({
    resolver: zodResolver(NewListingSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  const galleryImages = watch('galleryImages') || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, propertyTypesRes, officeTypesRes, languagesRes] = await Promise.all([
          locationService.getLocations(),
          propertyTypeService.getPropertyTypes(),
          officeTypeService.getOfficeTypes(),
          languageService.getLanguages({ limit: 100 })
        ]);
        setLocations(locationsRes.data);
        setPropertyTypes(propertyTypesRes.data);
        setOfficeTypes(officeTypesRes.data);
        setLanguages(languagesRes.data.data);
        
        // Set default language
        const defaultLang = languagesRes.data.data.find(lang => lang.isDefault);
        if (defaultLang) {
          setSelectedLanguage(defaultLang);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      let coverImageUrl = '';

      // Handle cover image upload if there's a new file
      if (data.coverImage && data.coverImage instanceof File) {
        const formData = new FormData();
        formData.append('coverImage', data.coverImage);

        try {
          const uploadResponse = await penthouseService.uploadCoverImage(formData);
          if (uploadResponse.data?.responseStatus >= 200 && uploadResponse.data?.responseStatus < 300) {
            if (uploadResponse.data?.data?.coverImageUrl) {
              coverImageUrl = uploadResponse.data.data.coverImageUrl;
            }
          } else {
            console.error('Failed to upload cover image');
            return;
          }
        } catch (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          return;
        }
      }

      const submitData = {
        title: data.title,
        coverImage: coverImageUrl,
        locationId: data.locationId || undefined,
        propertyTypeId: data.propertyTypeId || undefined,
        officeTypeId: data.officeTypeId || undefined,
        propertyPrice: data.propertyPrice,
        status: data.status,
        publishStartDate: data.publishStartDate || undefined,
        publishEndDate: data.publishEndDate || undefined,
      };

      await penthouseService.createPenthouse(submitData);
      router.push('/menu/our-penthouses/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  });

  const handleDropMultiFile = (acceptedFiles: File[]) => {
    const currentImages = watch('galleryImages') || [];
    setValue('galleryImages', [
      ...currentImages,
      ...acceptedFiles.map((newFile) =>
        Object.assign(newFile, {
          preview: URL.createObjectURL(newFile),
        })
      ),
    ]);
  };

  const handleRemoveFile = (inputFile: File | string) => {
    const currentImages = watch('galleryImages') || [];
    const filesFiltered = currentImages.filter(
      (fileFiltered: any) => fileFiltered !== inputFile
    );
    setValue('galleryImages', filesFiltered);
  };

  const handleRemoveAllFiles = () => {
    setValue('galleryImages', []);
  };

  // Transform languages data for WorkspacesPopover
  const workspacesData = languages.map(lang => ({
    id: lang.id,
    name: lang.name,
    logo: lang.flagIcon || `/assets/icons/flags/ic-flag-${lang.code.toLowerCase()}.svg`,
    plan: lang.isDefault ? 'Default' : 'Active'
  }));

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Listing"
        links={[
          { name: 'Menu', href: '/menu' },
          { name: 'Our Penthouses', href: '/menu/our-penthouses' },
          { name: 'Listings', href: '/menu/our-penthouses/listings' },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Language Selector */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Language:
        </Typography>
        <WorkspacesPopover data={workspacesData} />
      </Box>

      <Form methods={methods} onSubmit={onSubmit}>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="listing tabs">
              <Tab label="Information" {...a11yProps(0)} />
              <Tab label="Neighborhood" {...a11yProps(1)} />
              <Tab label="Visual VDO/Gallery" {...a11yProps(2)} />
            </Tabs>
          </Box>

          {/* Tab 1: Information */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Listing Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Field.Text
                        name="title"
                        label="Title"
                        placeholder="Enter listing title"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field.Text
                        name="propertyPrice"
                        label="Property Price (THB)"
                        placeholder="Enter property price"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Field.UploadCoverImage
                        name="coverImage"
                        maxSize={3145728}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field.Select
                        name="locationId"
                        label="Location"
                        placeholder="Select location"
                      >
                        <MenuItem value="">
                          <em>Select location</em>
                        </MenuItem>
                        {locations.map((location) => (
                          <MenuItem key={location.id} value={location.id}>
                            {location.name}
                          </MenuItem>
                        ))}
                      </Field.Select>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field.Select
                        name="propertyTypeId"
                        label="Property Type"
                        placeholder="Select property type"
                      >
                        <MenuItem value="">
                          <em>Select property type</em>
                        </MenuItem>
                        {propertyTypes.map((propertyType) => (
                          <MenuItem key={propertyType.id} value={propertyType.id}>
                            {propertyType.name}
                          </MenuItem>
                        ))}
                      </Field.Select>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field.Select
                        name="officeTypeId"
                        label="Office Type"
                        placeholder="Select office type"
                      >
                        <MenuItem value="">
                          <em>Select office type</em>
                        </MenuItem>
                        {officeTypes.map((officeType) => (
                          <MenuItem key={officeType.id} value={officeType.id}>
                            {officeType.name}
                          </MenuItem>
                        ))}
                      </Field.Select>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field.Select
                        name="status"
                        label="Status"
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </Field.Select>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field.DatePicker
                        name="publishStartDate"
                        label="Publish Start Date"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field.DatePicker
                        name="publishEndDate"
                        label="Publish End Date"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Content
                  </Typography>
                  <Controller
                    name="content"
                    control={methods.control}
                    render={({ field }) => (
                      <Editor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter listing content..."
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          {/* Tab 2: Neighborhood */}
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Neighborhood
                </Typography>
                <Controller
                  name="neighborhood"
                  control={methods.control}
                  render={({ field }) => (
                    <Editor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter neighborhood information..."
                    />
                  )}
                />
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab 3: Visual VDO/Gallery */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Visual VDO/Gallery
                </Typography>
                <Upload
                  multiple
                  thumbnail
                  value={galleryImages}
                  onDrop={handleDropMultiFile}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  onUpload={() => console.info('ON UPLOAD')}
                />
              </CardContent>
            </Card>
          </TabPanel>
        </Card>

        <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/menu/our-penthouses/listings')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            Create Listing
          </LoadingButton>
        </Box>
      </Form>
    </DashboardContent>
  );
}
