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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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
import { officeTypeService } from 'src/services/office-type.service';
import { languageService } from 'src/services/language.service';
import type { IPenthouse, UpdatePenthouseDto } from 'src/types/penthouse';
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

type Props = {
  id: string;
};

export function ListingDetailView({ id }: Props) {
  const router = useRouter();
  const [penthouse, setPenthouse] = useState<IPenthouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [officeTypes, setOfficeTypes] = useState<IOfficeType[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [content, setContent] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const [editData, setEditData] = useState<UpdatePenthouseDto>({
    title: '',
    coverImage: '',
    locationId: '',
    propertyTypeId: '',
    officeTypeId: '',
    propertyPrice: undefined,
    status: 'draft',
    publishStartDate: '',
    publishEndDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [penthouseRes, locationsRes, propertyTypesRes, officeTypesRes, languagesRes] = await Promise.all([
          penthouseService.getPenthouse(id),
          locationService.getLocations(),
          propertyTypeService.getPropertyTypes(),
          officeTypeService.getOfficeTypes(),
          languageService.getLanguages({ limit: 100 })
        ]);
        
        setPenthouse(penthouseRes);
        setLocations(locationsRes.data);
        setPropertyTypes(propertyTypesRes.data);
        setOfficeTypes(officeTypesRes.data);
        setLanguages(languagesRes.data.data);
        
        // Set default language
        const defaultLang = languagesRes.data.data.find(lang => lang.isDefault);
        if (defaultLang) {
          setSelectedLanguage(defaultLang);
        }
        
        setEditData({
          title: penthouseRes.title,
          coverImage: penthouseRes.coverImage || '',
          locationId: penthouseRes.locationId || '',
          propertyTypeId: penthouseRes.propertyTypeId || '',
          officeTypeId: penthouseRes.officeTypeId || '',
          propertyPrice: penthouseRes.propertyPrice || undefined,
          status: penthouseRes.status,
          publishStartDate: penthouseRes.publishStartDate || '',
          publishEndDate: penthouseRes.publishEndDate || ''
        });
      } catch (err) {
        setError('Failed to load listing');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUpdate = async () => {
    if (!penthouse || !editData.title?.trim()) return;

    try {
      setUpdating(true);
      const submitData = {
        ...editData,
        locationId: editData.locationId || undefined,
        propertyTypeId: editData.propertyTypeId || undefined,
        publishStartDate: editData.publishStartDate || undefined,
        publishEndDate: editData.publishEndDate || undefined,
      };
      const updatedPenthouse = await penthouseService.updatePenthouse(penthouse.id, submitData);
      setPenthouse(updatedPenthouse);
      setEditOpen(false);
    } catch (err) {
      console.error('Error updating listing:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!penthouse) return;

    try {
      setDeleting(true);
      await penthouseService.deletePenthouse(penthouse.id);
      router.push('/menu/our-penthouses/listings');
    } catch (err) {
      console.error('Error deleting listing:', err);
      setDeleting(false);
    }
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

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error || !penthouse) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Typography color="error">{error || 'Listing not found'}</Typography>
        </Box>
      </DashboardContent>
    );
  }

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
        heading="Listing Detail"
        links={[
          { name: 'Menu', href: '/menu' },
          { name: 'Our Penthouses', href: '/menu/our-penthouses' },
          { name: 'Listings', href: '/menu/our-penthouses/listings' },
          { name: penthouse.title },
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

      {/* Language Selector */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Language:
        </Typography>
        <WorkspacesPopover data={workspacesData} />
      </Box>

      {/* Tabs */}
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* Existing Information */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Listing Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Title
                        </Typography>
                        <Typography variant="body1">
                          {penthouse.title}
                        </Typography>
                      </Grid>

                      {penthouse.coverImage && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Cover Image
                          </Typography>
                          <Box mt={1}>
                            <img 
                              src={penthouse.coverImage} 
                              alt={penthouse.title}
                              style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </Box>
                        </Grid>
                      )}

                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body1">
                          {penthouse.location?.name || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Property Type
                        </Typography>
                        <Typography variant="body1">
                          {penthouse.propertyType?.name || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Office Type
                        </Typography>
                        <Typography variant="body1">
                          {penthouse.officeType?.name || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Property Price
                        </Typography>
                        <Typography variant="body1">
                          {penthouse.propertyPrice ? `฿${Number(penthouse.propertyPrice).toLocaleString()}` : 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={penthouse.status.charAt(0).toUpperCase() + penthouse.status.slice(1)}
                          color={
                            penthouse.status === 'published' ? 'success' :
                            penthouse.status === 'draft' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </Grid>

                      {penthouse.publishStartDate && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Publish Start Date
                          </Typography>
                          <Typography variant="body1">
                            {new Date(penthouse.publishStartDate).toLocaleString()}
                          </Typography>
                        </Grid>
                      )}

                      {penthouse.publishEndDate && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Publish End Date
                          </Typography>
                          <Typography variant="body1">
                            {new Date(penthouse.publishEndDate).toLocaleString()}
                          </Typography>
                        </Grid>
                      )}
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
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Information
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Active Status
                    </Typography>
                    <Chip
                      label={penthouse.isActive ? 'Enable' : 'Disable'}
                      color={penthouse.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Created Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(penthouse.createdDate).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Updated Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(penthouse.updatedDate).toLocaleString()}
                    </Typography>
                  </Box>

                  {penthouse.createdByName && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Created By
                      </Typography>
                      <Typography variant="body1">
                        {penthouse.createdByName}
                      </Typography>
                    </Box>
                  )}

                  {penthouse.updatedByName && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Updated By
                      </Typography>
                      <Typography variant="body1">
                        {penthouse.updatedByName}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Listing</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cover Image URL"
                value={editData.coverImage}
                onChange={(e) => setEditData({ ...editData, coverImage: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={editData.locationId}
                  label="Location"
                  onChange={(e) => setEditData({ ...editData, locationId: e.target.value })}
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
                  value={editData.propertyTypeId}
                  label="Property Type"
                  onChange={(e) => setEditData({ ...editData, propertyTypeId: e.target.value })}
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
              <FormControl fullWidth>
                <InputLabel>Office Type</InputLabel>
                <Select
                  value={editData.officeTypeId}
                  label="Office Type"
                  onChange={(e) => setEditData({ ...editData, officeTypeId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {officeTypes.map((officeType) => (
                    <MenuItem key={officeType.id} value={officeType.id}>
                      {officeType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Price (THB)"
                value={editData.propertyPrice || ''}
                onChange={(e) => setEditData({ ...editData, propertyPrice: e.target.value || undefined })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editData.status}
                  label="Status"
                  onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained"
            disabled={updating || !editData.title?.trim()}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this listing? This action cannot be undone.
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
