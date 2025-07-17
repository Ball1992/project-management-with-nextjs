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

import { locationService } from 'src/services/location.service';
import type { CreateLocationDto } from 'src/types/location';

// ----------------------------------------------------------------------

export function LocationCreateView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLocationDto>({
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await locationService.createLocation(formData);
      router.push('/menu/our-penthouses/locations');
    } catch (err) {
      console.error('Error creating location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateLocationDto) => (
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
        heading="Create Location"
        links={[
          { name: 'Menu', href: '/menu' },
          { name: 'Our Penthouses', href: '/menu/our-penthouses' },
          { name: 'Locations', href: '/menu/our-penthouses/locations' },
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
                  Location Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  placeholder="Enter location name"
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/menu/our-penthouses/locations')}
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
                    {loading ? 'Creating...' : 'Create Location'}
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
