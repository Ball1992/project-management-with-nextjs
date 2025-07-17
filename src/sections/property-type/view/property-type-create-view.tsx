'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { propertyTypeService } from 'src/services/property-type.service';
import type { CreatePropertyTypeDto } from 'src/types/property-type';

// ----------------------------------------------------------------------

export function PropertyTypeCreateView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePropertyTypeDto>({
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await propertyTypeService.createPropertyType(formData);
      router.push('/menu/our-penthouses/property-type');
    } catch (err) {
      console.error('Error creating property type:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreatePropertyTypeDto) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Property Type"
        links={[
          { name: 'Menu', href: '/menu' },
          { name: 'Our Penthouses', href: '/menu/our-penthouses' },
          { name: 'Property Types', href: '/menu/our-penthouses/property-type' },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Property Type Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Property Type Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  placeholder="Enter property type name"
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/menu/our-penthouses/property-type')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.name.trim()}
                    startIcon={loading ? <Iconify icon="eos-icons:loading" /> : <Iconify icon="eva:save-fill" />}
                  >
                    {loading ? 'Creating...' : 'Create Property Type'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
