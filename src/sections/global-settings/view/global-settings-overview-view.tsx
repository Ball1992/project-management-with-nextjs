'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function GlobalSettingsOverviewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Global Settings Overview"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Global Settings' },
          { name: 'Overview' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Application Name: Thailand Penthouses CMS
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Version: 1.0.0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Environment: Development
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API Configuration
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  API URL: http://localhost:3000
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: Connected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage system-wide settings and configurations from this panel.
                Use the navigation menu to access specific settings sections.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
