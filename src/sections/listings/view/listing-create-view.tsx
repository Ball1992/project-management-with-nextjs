'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { WorkspacesPopover } from 'src/layouts/components/workspaces-popover';
import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';

import { penthouseService } from 'src/services/penthouse.service';
import { locationService } from 'src/services/location.service';
import { propertyTypeService } from 'src/services/property-type.service';
import { languageService } from 'src/services/language.service';
import type { CreatePenthouseDto } from 'src/types/penthouse';
import type { ILocation } from 'src/types/location';
import type { IPropertyType } from 'src/types/property-type';
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

export function ListingCreateView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [content, setContent] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [formData, setFormData] = useState<CreatePenthouseDto>({
    title: '',
    coverImage: '',
    locationId: '',
    propertyTypeId: '',
    propertyPrice: undefined,
    status: 'draft',
    publishStartDate: '',
    publishEndDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, propertyTypesRes, languagesRes] = await Promise.all([
          locationService.getLocations(),
          propertyTypeService.getPropertyTypes(),
          languageService.getLanguages({ limit: 100 })
        ]);
        setLocations(locationsRes.data);
        setPropertyTypes(propertyTypesRes.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        locationId: formData.locationId || undefined,
        propertyTypeId: formData.propertyTypeId || undefined,
        publishStartDate: formData.publishStartDate || undefined,
        publishEndDate: formData.publishEndDate || undefined,
      };
      await penthouseService.createPenthouse(submitData);
      router.push('/menu/our-penthouses/listings');
    } catch (err) {
      console.error('Error creating listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreatePenthouseDto) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'propertyPrice' ? 
      (event.target.value ? Number(event.target.value) : undefined) : 
      event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDropMultiFile = (acceptedFiles: File[]) => {
    setGalleryImages([
      ...galleryImages,
      ...acceptedFiles.map((newFile) =>
        Object.assign(newFile, {
          preview: URL.createObjectURL(newFile),
        })
      ),
    ]);
  };

  const handleRemoveFile = (inputFile: File | string) => {
    const filesFiltered = galleryImages.filter(
      (fileFiltered) => fileFiltered !== inputFile
    );
    setGalleryImages(filesFiltered);
  };

  const handleRemoveAllFiles = () => {
    setGalleryImages([]);
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

      <form onSubmit={handleSubmit}>
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
                      <TextField
                        fullWidth
                        label="Title"
                        value={formData.title}
                        onChange={handleChange('title')}
                        required
                        placeholder="Enter listing title"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Cover Image URL"
                        value={formData.coverImage}
                        onChange={handleChange('coverImage')}
                        placeholder="Enter cover image URL"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Location</InputLabel>
                        <Select
                          value={formData.locationId}
                          label="Location"
                          onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {locations.map((location) => (
                            <MenuItem key={location.id} value={location.id}>
                              {location.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Property Type</InputLabel>
                        <Select
                          value={formData.propertyTypeId}
                          label="Property Type"
                          onChange={(e) => setFormData(prev => ({ ...prev, propertyTypeId: e.target.value }))}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {propertyTypes.map((propertyType) => (
                            <MenuItem key={propertyType.id} value={propertyType.id}>
                              {propertyType.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Property Price (THB)"
                        type="number"
                        value={formData.propertyPrice || ''}
                        onChange={handleChange('propertyPrice')}
                        placeholder="Enter property price"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={formData.status}
                          label="Status"
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        >
                          <MenuItem value="draft">Draft</MenuItem>
                          <MenuItem value="published">Published</MenuItem>
                          <MenuItem value="archived">Archived</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Publish Start Date"
                        type="datetime-local"
                        value={formData.publishStartDate}
                        onChange={handleChange('publishStartDate')}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Publish End Date"
                        type="datetime-local"
                        value={formData.publishEndDate}
                        onChange={handleChange('publishEndDate')}
                        InputLabelProps={{
                          shrink: true,
                        }}
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
                  <Editor
                    value={content}
                    onChange={(value) => setContent(value)}
                    placeholder="Enter listing content..."
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
                <Editor
                  value={neighborhood}
                  onChange={(value) => setNeighborhood(value)}
                  placeholder="Enter neighborhood information..."
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
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.title.trim()}
            startIcon={loading ? <Iconify icon="eos-icons:loading" /> : <Iconify icon="eva:save-fill" />}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </Box>
      </form>
    </DashboardContent>
  );
}
