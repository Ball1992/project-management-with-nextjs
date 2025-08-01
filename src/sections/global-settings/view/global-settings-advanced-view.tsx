'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function GlobalSettingsAdvancedView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Advanced Settings"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Global Settings' },
          { name: 'Advanced' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API Configuration
              </Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="API Base URL"
                  defaultValue="http://localhost:3000"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="API Timeout (ms)"
                  defaultValue="30000"
                  type="number"
                  variant="outlined"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable API Logging"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  defaultValue="60"
                  type="number"
                  variant="outlined"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Two-Factor Authentication"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Force HTTPS"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Maintenance
              </Typography>
              <Stack spacing={3}>
                <FormControlLabel
                  control={<Switch />}
                  label="Maintenance Mode"
                />
                <TextField
                  fullWidth
                  label="Maintenance Message"
                  multiline
                  rows={3}
                  defaultValue="System is under maintenance. Please try again later."
                  variant="outlined"
                />
                <Box>
                  <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                    Save Settings
                  </Button>
                  <Button variant="outlined">
                    Reset to Default
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
